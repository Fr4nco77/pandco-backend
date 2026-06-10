import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { StripeService } from '../stripe/stripe.service.js';
import { EmailService } from '../email/email.service.js';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly emailService: EmailService,
  ) {}

  async createOrder(userId: string) {
    // 1. Buscamos el carrito activo del usuario con sus variantes y precios vigentes
    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        userId,
        variant: { product: { deletedAt: null } },
      },
      include: {
        variant: {
          include: { product: true },
        },
      },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException(
        'Cannot create an order with an empty cart.',
      );
    }

    try {
      // 2. Iniciamos la Transacción Interactiva ACID de Prisma
      const newOrder = await this.prisma.$transaction(async (tx) => {
        let totalAmount = 0;
        const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

        // 3. Validar y restar Stock secuencialmente por cada item
        for (const item of cartItems) {
          const variant = item.variant;
          const product = variant.product;

          // Verificación de stock en tiempo real dentro de la transacción
          if (variant.stockQuantity < item.quantity) {
            throw new BadRequestException(
              `Conflictive stock for product: ${product.name} (${variant.size}/${variant.color}). Available: ${variant.stockQuantity}, Requested: ${item.quantity}`,
            );
          }

          // Restamos el stock de la variante de forma atómica
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });

          // Calculamos el precio real congelado (con descuento si aplica)
          const priceAtPurchase = product.discountPrice ?? product.basePrice;
          totalAmount += Number(priceAtPurchase) * item.quantity;

          // Estructuramos el array para la creación masiva de los OrderItems
          orderItemsData.push({
            variantId: variant.id,
            quantity: item.quantity,
            priceAtPurchase: priceAtPurchase,
          });
        }

        // 4. Creamos la Orden en estado 'pending'
        const order = await tx.order.create({
          data: {
            userId,
            totalAmount: new Prisma.Decimal(totalAmount),
            status: 'pending',
            items: {
              createMany: {
                data: orderItemsData,
              },
            },
          },
          include: {
            items: true,
          },
        });

        // 5. Vaciamos el carrito del usuario de forma segura dentro del mismo flujo
        await tx.cartItem.deleteMany({
          where: { userId },
        });

        return order;
      });

      // Una vez guardada la orden en la base de datos, inicializaremos la pasarela:

      const stripeSession = await this.stripe.client.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/checkout/success?orderId=${newOrder.id}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
        metadata: {
          orderId: newOrder.id,
          userId: userId,
        },
        line_items: cartItems.map((item) => {
          const price =
            item.variant.product.discountPrice ??
            item.variant.product.basePrice;
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.variant.product.name,
                description: `Size: ${item.variant.size} - Color: ${item.variant.color}`,
              },
              unit_amount: Math.round(Number(price) * 100), // En centavos
            },
            quantity: item.quantity,
          };
        }),
      });

      return {
        orderId: newOrder.id,
        checkoutUrl: stripeSession.url,
      };
    } catch (error) {
      // Capturamos cualquier excepción lanzada para evitar fugas de información
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'An unexpected error occurred while processing the order.',
      );
    }
  }

  async findAll(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        // Hacemos un conteo relacional directo en la DB de los items (muy rápido)
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => ({
      orderId: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      totalItems: order._count.items,
    }));
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    return order;
  }

  async markAsPaid(orderId: string) {
    // 1. Actualizamos la orden e incluimos al usuario para obtener su email y nombre
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid' },
      include: {
        user: true,
      },
    });

    // 2. Disparar el email en segundo plano (Sin 'await' para no retrasar a Stripe)
    this.emailService
      .sendEmailPurchase(updatedOrder.user.email, updatedOrder.user.firstName)
      .catch((err) => {
        // Es crítico capturar el error aquí para que una falla de email
        // no rompa la ejecución ni le haga creer a Stripe que el pago falló.
        console.error(
          `Failed to send purchase email for order ${orderId}:`,
          err,
        );
      });

    return updatedOrder;
  }

  async cancelOrder(orderId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Buscamos la orden con sus ítems y el usuario antes de borrarla
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, user: true },
      });

      // Si la orden ya no existe (por ejemplo, un webhook duplicado), salimos pacíficamente
      if (!order) return;

      // 2. Devolvemos el stock a cada variante de forma atómica
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }

      // 3. Borramos los OrderItems primero (por la restricción de clave foránea)
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      // 4. Borramos la orden madre
      await tx.order.delete({
        where: { id: orderId },
      });

      // Disparar email de error/cancelación en segundo plano
      this.emailService
        .sendEmailPurchaseError(order.user.email, order.user.firstName)
        .catch((err) => {
          console.error(
            `Failed to send cancellation email for order ${orderId}:`,
            err,
          );
        });
    });
  }
}

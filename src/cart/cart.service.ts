import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, addToCartDto: AddToCartDto) {
    const { variantId, quantity } = addToCartDto;

    // 1. Validar existencia de la variante y disponibilidad de Stock
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stockQuantity: true, product: { select: { deletedAt: true } } },
    });

    if (!variant || variant.product.deletedAt !== null) {
      throw new NotFoundException(
        'The requested product variant does not exist or has been removed.',
      );
    }

    if (variant.stockQuantity < quantity) {
      throw new BadRequestException(
        `Not enough stock available. Maximum available: ${variant.stockQuantity}`,
      );
    }

    // 2. Operación Atómica Upsert utilizando el índice único compuesto
    return await this.prisma.cartItem.upsert({
      where: {
        userId_variantId: { userId, variantId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId,
        variantId,
        quantity,
      },
    });
  }

  async findAll(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        userId,
        variant: {
          product: { deletedAt: null },
        },
      },
      select: {
        id: true,
        quantity: true,
        variant: {
          select: {
            id: true,
            size: true,
            color: true,
            stockQuantity: true,
            product: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                discountPrice: true,
                images: {
                  select: {
                    url: true,
                    color: true,
                    isMain: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return cartItems.map((item) => {
      const variant = item.variant;
      const product = variant.product;
      const price = product.discountPrice ?? product.basePrice;

      // 🎯 LÓGICA DE UX PARA LA IMAGEN:
      // 1. Intentamos buscar una imagen que coincida exactamente con el color de la variante elegida
      let chosenImage = product.images.find(
        (img) => img.color.toLowerCase() === variant.color.toLowerCase(),
      )?.url;

      // 2. Fallback: Si no hay fotos específicas para ese color, usamos la primera que tenga `isMain: true`
      if (!chosenImage) {
        chosenImage = product.images.find((img) => img.isMain)?.url;
      }

      // 3. Segundo Fallback: Si no hay ninguna marcada como main, agarramos la primera que exista
      if (!chosenImage) {
        chosenImage = product.images[0]?.url;
      }

      return {
        cartItemId: item.id,
        variantId: variant.id,
        productId: product.id,
        name: product.name,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        stockAvailable: variant.stockQuantity,
        unitPrice: price,
        subTotal: Number(price) * item.quantity,
        mainImage: chosenImage,
      };
    });
  }

  async updateQuantity(
    id: string,
    userId: string,
    updateCartQuantityDto: UpdateCartQuantityDto,
  ) {
    const { quantity } = updateCartQuantityDto;

    try {
      // 1. Verificamos primero el stock de la variante asociada a este item del carrito
      const cartItem = await this.prisma.cartItem.findFirst({
        where: { id, userId },
        select: { variant: { select: { stockQuantity: true } } },
      });

      if (!cartItem) {
        throw new NotFoundException(`Cart item with ID ${id} not found.`);
      }

      if (cartItem.variant.stockQuantity < quantity) {
        throw new BadRequestException(
          `Cannot update quantity. Only ${cartItem.variant.stockQuantity} items in stock.`,
        );
      }

      // 2. Actualizamos la cantidad directamente de forma segura
      return await this.prisma.cartItem.update({
        where: { id },
        data: { quantity },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Cart item with ID ${id} not found.`);
      }
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    // deleteMany sí acepta cualquier filtro en el where
    const deleteResult = await this.prisma.cartItem.deleteMany({
      where: { id, userId },
    });

    // Si no encontró el registro con ese ID Y ese userId, el conteo será 0
    if (deleteResult.count === 0) {
      throw new NotFoundException(`Cart item with ID ${id} not found.`);
    }

    return { success: true };
  }

  async clear(userId: string) {
    // Vacía por completo el carrito del usuario (útil tras finalizar una compra con éxito)
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });

    return {
      success: true,
    };
  }
}

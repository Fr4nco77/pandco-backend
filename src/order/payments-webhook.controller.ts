import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from '../stripe/stripe.service.js';
import { OrderService } from './order.service.js';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

// 🛡️ Extendemos la interfaz Request para registrar legalmente la propiedad rawBody de NestJS
interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

@Controller('webhooks/payments')
export class PaymentsWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly orderService: OrderService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RequestWithRawBody,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header.');
    }

    if (!req.rawBody) {
      throw new BadRequestException(
        'Missing rawBody buffer in request. Check main.ts configuration.',
      );
    }

    // 🛡️ Tipamos el evento nativamente con el SDK de Stripe
    let event: Stripe.Event;

    try {
      event = this.stripeService.client.webhooks.constructEvent(
        req.rawBody,
        signature,
        this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (err: any) {
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Webhook signature verification failed: ${err.message}`,
      );
    }

    // Procesamos únicamente si el evento pertenece al flujo de Checkout Sessions
    if (event.type.startsWith('checkout.session.')) {
      // 🛡️ Forzamos el tipado estricto del objeto interno al modelo de sesión de Stripe
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        return {
          message: 'Webhook received but missing orderId metadata. Ignored.',
        };
      }

      switch (event.type) {
        case 'checkout.session.completed':
          await this.orderService.markAsPaid(orderId);
          break;

        case 'checkout.session.expired':
          await this.orderService.cancelOrder(orderId);
          break;

        default:
          break;
      }
    }

    return { received: true };
  }
}

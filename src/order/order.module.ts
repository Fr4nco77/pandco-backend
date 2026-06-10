import { Module } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { OrderController } from './order.controller.js';
import { StripeModule } from '../stripe/stripe.module.js';
import { EmailModule } from '../email/email.module.js';
import { PaymentsWebhookController } from './payments-webhook.controller.js';

@Module({
  imports: [StripeModule, EmailModule],
  controllers: [OrderController, PaymentsWebhookController],
  providers: [OrderService],
})
export class OrderModule {}

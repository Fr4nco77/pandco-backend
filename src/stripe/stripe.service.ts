import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  public readonly client: Stripe;
  constructor(private configService: ConfigService) {
    this.client = new Stripe(
      configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
  }
}

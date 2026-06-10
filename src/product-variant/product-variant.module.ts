import { Module } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service.js';
import { ProductVariantController } from './product-variant.controller.js';

@Module({
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
})
export class ProductVariantModule {}

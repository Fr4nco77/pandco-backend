import { Module } from '@nestjs/common';
import { ProductImageService } from './product-image.service.js';
import { ProductImageController } from './product-image.controller.js';

@Module({
  controllers: [ProductImageController],
  providers: [ProductImageService],
})
export class ProductImageModule {}

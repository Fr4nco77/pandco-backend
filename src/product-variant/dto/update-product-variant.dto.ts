import { PartialType } from '@nestjs/mapped-types';
import { CreateProductVariantDto } from './create-product-variant.dto.js';

export class UpdateProductVariantDto extends PartialType(
  CreateProductVariantDto,
) {}

import {
  IsEnum,
  IsArray,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { ProductCategory } from '../../generated/prisma/enums.js';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountPrice?: number;

  @IsNotEmpty()
  @IsEnum(ProductCategory)
  category!: ProductCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specs?: string[];

  @IsOptional()
  @IsString()
  collectionId?: string;

  @IsNotEmpty()
  @IsString()
  typeId!: string;
}

import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '../../generated/prisma/enums.js';

export enum SortOption {
  NEWEST = 'newest',
  BEST_SELLER = 'best-seller',
  PRICE_ASC = 'price-asc',
  PRICE_DESC = 'price-desc',
}

export class FindAllProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 30; // Mostramos 30 productos por defecto por página

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  typeSlug?: string;

  @IsOptional()
  @IsString()
  collectionSlug?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsEnum(SortOption)
  sortBy?: SortOption = SortOption.NEWEST;
}

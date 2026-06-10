import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsNotEmpty()
  @IsUUID()
  productId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  sku!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  size!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  color!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stockQuantity!: number;
}

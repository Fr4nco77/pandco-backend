import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  variantId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

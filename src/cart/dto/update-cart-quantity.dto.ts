import { IsInt, IsPositive } from 'class-validator';

export class UpdateCartQuantityDto {
  @IsInt()
  @IsPositive()
  quantity!: number;
}

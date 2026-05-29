import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { TokenDto } from './token.dto.js';

export class ResetPasswordDto extends TokenDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}

import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ForgotPasswordDto } from './forgot-password.dto.js';

export class LoginDto extends ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

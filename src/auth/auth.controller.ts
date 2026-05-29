import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import configCookies from '../consts/configCookies.js';
import { AuthService } from './auth.service.js';
import { LocalAuthGuard } from './local-auth.guard.js';
import { RegisterDto } from './dto/register.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { TokenDto } from './dto/token.dto.js';
import { ResetPasswordDto } from './dto/resetPassword.dto.js';
import PayloadJWT from './interfaces/payload-jwt.interface.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(registerDto);
    const token = this.authService.login(user);

    res.cookie('access_token', token, configCookies as CookieOptions);
    return {
      message: 'User successfully registered.',
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Req() { user }: Request & { user: PayloadJWT },
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = this.authService.login(user);
    res.cookie('access_token', token, configCookies as CookieOptions);
    return {
      message: 'Logged in successfully.',
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return {
      message:
        'If that email address is in our system, we will send you a link to reset your password.',
    };
  }

  @Get('reset-password/:token')
  async verifyResetToken(@Param() { token }: TokenDto) {
    await this.authService.validateResetPasswordToken(token);
    return {
      message: 'Token verified successfully.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return {
      message: 'Password has been reset successfully.',
    };
  }
}

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service.js';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { RestorePasswordService } from '../restore-password/restore-password.service.js';
import { ResetPasswordDto } from './dto/resetPassword.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import PayloadJWT from './interfaces/payload-jwt.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private restorePassword: RestorePasswordService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.findOneByEmail(registerDto.email);
    if (user)
      throw new ConflictException('This email address is already registered.');

    const passwordHashed = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.userService.create({
      ...registerDto,
      password: passwordHashed,
    });

    // Disparar el email  de bienvenida en segundo plano (Sin 'await')
    this.emailService
      .sendEmailRegister(registerDto.email, registerDto.firstName)
      .catch((err) => {
        console.error(`Failed to send register email:`, err);
      });

    return {
      id: newUser.id,
      role: newUser.role,
    };
  }

  async validateUser({ email, password }: LoginDto) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Email o password incorrect.');

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (!isSamePassword)
      throw new UnauthorizedException('Email o password incorrect.');

    return {
      id: user.id,
      role: user.role,
    };
  }

  login({ id, role }: PayloadJWT) {
    const payload = { sub: id, role: role };
    return this.jwtService.sign(payload);
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) return;

    const token = await this.restorePassword.createOrUpdateToken(user.id);

    await this.emailService.sendEmailForgotPassword(
      email,
      user.firstName,
      token,
    );
  }

  async validateResetPasswordToken(token: string) {
    await this.restorePassword.verifyResetToken(token);
  }

  async resetPassword({ token, newPassword }: ResetPasswordDto) {
    const userId = await this.restorePassword.deleteToken(token);
    const passwordHashed = await bcrypt.hash(newPassword, 10);
    await this.userService.update(userId, { password: passwordHashed });
  }
}

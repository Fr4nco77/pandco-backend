import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { randomBytes } from 'node:crypto';

@Injectable()
export class RestorePasswordService {
  private expireTime: number;
  constructor(private readonly prisma: PrismaService) {
    this.expireTime = 1000 * 60 * 60; // 1 hora
  }

  async createOrUpdateToken(userId: string): Promise<string> {
    const expireAt = new Date(Date.now() + this.expireTime);

    const token = await this.generateUniqueToken();

    try {
      await this.prisma.restorePassword.upsert({
        where: { userId },
        update: {
          token,
          expireAt,
        },
        create: {
          token,
          expireAt,
          userId,
        },
      });
      return token;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to process password reset token.',
      );
    }
  }

  async verifyResetToken(token: string) {
    const currentToken = await this.prisma.restorePassword.findUnique({
      where: { token },
    });
    if (!currentToken)
      throw new UnauthorizedException(
        'Invalid or expired password reset token.',
      );
    else if (currentToken.expireAt < new Date())
      throw new UnauthorizedException(
        'Invalid or expired password reset token.',
      );
  }

  async deleteToken(token: string) {
    try {
      const { userId } = await this.prisma.restorePassword.delete({
        where: { token },
      });

      return userId;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to invalidate the token.');
    }
  }

  private async generateUniqueToken(): Promise<string> {
    let token: string;
    let exists = true;

    do {
      token = randomBytes(32).toString('hex');

      const found = await this.prisma.restorePassword.findUnique({
        where: { token },
      });
      if (!found) exists = false;
    } while (exists);

    return token;
  }
}

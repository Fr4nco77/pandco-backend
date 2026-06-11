/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/client.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Inyectado previamente por tu JwtAuthGuard / Passport

    if (!user) {
      throw new UnauthorizedException(
        'Authentication required to verify permissions.',
      );
    }

    if (user.role !== Role.admin) {
      throw new ForbiddenException(
        'You do not have administrative privileges to perform this action.',
      );
    }

    return true;
  }
}

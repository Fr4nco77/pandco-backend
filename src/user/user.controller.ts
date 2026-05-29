import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import PayloadJWT from '../auth/interfaces/payload-jwt.interface.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUser(@Req() req: Request & { user: PayloadJWT }) {
    const user = await this.userService.findOneByIdOrThrow(req.user.id);
    const { firstName, lastName, email } = user;

    return {
      message: 'Profile retrieved.',
      data: {
        firstName,
        lastName,
        email,
      },
    };
  }
}

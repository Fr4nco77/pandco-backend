import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import PayloadJWT from '../auth/interfaces/payload-jwt.interface.js';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async findAll(@Req() req: Request & { user: PayloadJWT }) {
    const userId = req.user.id;
    const wishlist = await this.wishlistService.findAll(userId);

    return {
      message: 'Wishlist retrieved successfully.',
      data: wishlist,
    };
  }

  @Post(':productId')
  @HttpCode(HttpStatus.OK)
  async toggle(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request & { user: PayloadJWT },
  ) {
    const userId = req.user.id;
    return await this.wishlistService.toggle(userId, productId);
  }

  @Delete(':productId')
  async remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request & { user: PayloadJWT },
  ) {
    const userId = req.user.id;
    const status = await this.wishlistService.remove(userId, productId);

    return {
      message: 'Item removed from wishlist.',
      ...status,
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import PayloadJWT from '../auth/interfaces/payload-jwt.interface.js';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async findAll(@Req() req: Request & { user: PayloadJWT }) {
    const userId = req.user.id;
    const cart = await this.cartService.findAll(userId);

    return {
      message: 'Cart retrieved successfully.',
      data: cart,
    };
  }

  @Post()
  async add(
    @Body() addToCartDto: AddToCartDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    const userId = req.user.id;
    const item = await this.cartService.add(userId, addToCartDto);

    return {
      message: 'Product variant added to cart successfully.',
      data: item,
    };
  }

  @Patch(':id')
  async updateQuantity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCartQuantityDto: UpdateCartQuantityDto,
    @Req() req: Request & { user: PayloadJWT },
  ) {
    const userId = req.user.id;
    const updatedItem = await this.cartService.updateQuantity(
      id,
      userId,
      updateCartQuantityDto,
    );

    return {
      message: 'Cart item quantity updated successfully.',
      data: updatedItem,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: PayloadJWT },
  ) {
    const userId = req.user.id;
    const status = await this.cartService.remove(id, userId);

    return {
      message: 'Item removed from cart.',
      ...status,
    };
  }

  @Delete('clear')
  async clear(@Req() req: Request & { user: PayloadJWT }) {
    const userId = req.user.id;
    const status = await this.cartService.clear(userId);

    return {
      message: 'Cart cleared successfully.',
      ...status,
    };
  }
}

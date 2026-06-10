import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrderService } from './order.service.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import PayloadJWT from '../auth/interfaces/payload-jwt.interface.js';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async findAll(@Req() req: Request & { user: PayloadJWT }) {
    const userId = req.user.id;
    const orders = await this.orderService.findAll(userId);

    return {
      message: 'Purchase history retrieved successfully.',
      data: orders,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: PayloadJWT },
  ) {
    const userId = req.user.id;
    const order = await this.orderService.findOne(id, userId);

    return {
      message: 'Order retrieved successfully.',
      data: order,
    };
  }

  @Post()
  async create(@Req() req: Request & { user: PayloadJWT }) {
    const userId = req.user.id;
    const orderData = await this.orderService.createOrder(userId);

    return {
      message: 'Order created and payment session initialized.',
      ...orderData,
    };
  }
}

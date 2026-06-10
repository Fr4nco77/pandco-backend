import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductVariantService } from './product-variant.service.js';
import { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { AdminGuard } from '../common/guards/admin.guard.js';

@Controller('product-variant')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createDto: CreateProductVariantDto) {
    const variant = await this.productVariantService.create(createDto);
    return { message: 'Variant created successfully.', data: variant };
  }

  @Get('product/:productId')
  async findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    const variants = await this.productVariantService.findByProduct(productId);
    return { message: 'Variants retrieved successfully.', data: variants };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductVariantDto,
  ) {
    const variant = await this.productVariantService.update(id, updateDto);
    return { message: 'Variant updated successfully.', data: variant };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productVariantService.remove(id);
    return { message: 'Variant deleted successfully.' };
  }
}

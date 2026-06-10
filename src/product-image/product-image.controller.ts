import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductImageService } from './product-image.service.js';
import { CreateProductImageDto } from './dto/create-product-image.dto.js';
import { UpdateProductImageDto } from './dto/update-product-image.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { AdminGuard } from '../common/guards/admin.guard.js';

@Controller('product-image')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createDto: CreateProductImageDto) {
    const image = await this.productImageService.create(createDto);
    return { message: 'Product image added successfully.', data: image };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductImageDto,
  ) {
    const image = await this.productImageService.update(id, updateDto);
    return { message: 'Product image updated successfully.', data: image };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productImageService.remove(id);
  }
}

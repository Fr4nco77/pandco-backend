import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { FindAllProductsDto } from './dto/findAll-product.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { AdminGuard } from '../common/guards/admin.guard.js';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 5)
  async findAll(@Query() query: FindAllProductsDto) {
    const data = await this.productService.findAll(query);

    return {
      message: 'Products retrieved successfully.',
      ...data,
    };
  }

  @Get(':slug')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 20)
  async findOne(@Param('slug') slug: string) {
    const product = await this.productService.findBySlug(slug);

    return {
      message: 'Product details retrieved successfully.',
      data: {
        ...product,
      },
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createProductDto: CreateProductDto) {
    const newProduct = await this.productService.create(createProductDto);
    return {
      message: 'Product created successfully.',
      data: newProduct,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const updatedProduct = await this.productService.update(
      id,
      updateProductDto,
    );
    return {
      message: 'Product updated successfully.',
      data: updatedProduct,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    await this.productService.softDelete(id);
    return {
      message: 'Product deleted successfully (soft delete).',
    };
  }
}

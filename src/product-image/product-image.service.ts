import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductImageDto } from './dto/create-product-image.dto.js';
import { UpdateProductImageDto } from './dto/update-product-image.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductImageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateProductImageDto) {
    const productExists = await this.prisma.product.findUnique({
      where: { id: createDto.productId },
    });
    if (!productExists || productExists.deletedAt) {
      throw new NotFoundException(
        `Product with ID "${createDto.productId}" not found.`,
      );
    }

    return this.prisma.productImage.create({ data: createDto });
  }

  async update(id: string, updateDto: UpdateProductImageDto) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Product image not found.');

    return this.prisma.productImage.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Product image not found.');

    // Borrado físico directo (las imágenes no bloquean flujos transaccionales históricos)
    await this.prisma.productImage.delete({ where: { id } });
  }
}

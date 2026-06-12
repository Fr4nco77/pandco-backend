import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductImageDto } from './dto/create-product-image.dto.js';
import { UpdateProductImageDto } from './dto/update-product-image.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class ProductImageService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createDto: CreateProductImageDto) {
    const productExists = await this.prisma.product.findUnique({
      where: { id: createDto.productId },
    });
    if (!productExists || productExists.deletedAt) {
      throw new NotFoundException(
        `Product with ID "${createDto.productId}" not found.`,
      );
    }

    const newImage = await this.prisma.productImage.create({ data: createDto });

    // Limpieza de cache
    await this.cacheManager.del('/product');
    await this.cacheManager.del(`/product/${productExists.slug}`);

    return newImage;
  }

  async update(id: string, updateDto: UpdateProductImageDto) {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!image) throw new NotFoundException('Product image not found.');

    const updatedImage = await this.prisma.productImage.update({
      where: { id },
      data: updateDto,
    });

    await this.cacheManager.del('/product');
    await this.cacheManager.del(`/product/${image.product.slug}`);

    return updatedImage;
  }

  async remove(id: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!image) throw new NotFoundException('Product image not found.');

    // Borrado físico directo (las imágenes no bloquean flujos transaccionales históricos)
    await this.prisma.productImage.delete({ where: { id } });

    await this.cacheManager.del('/product');
    await this.cacheManager.del(`/product/${image.product.slug}`);
  }
}

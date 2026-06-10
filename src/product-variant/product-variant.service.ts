import {
  ConflictException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductVariantUpdateInput } from '../generated/prisma/models.js';

@Injectable()
export class ProductVariantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateProductVariantDto) {
    // 1. Validar que el producto padre exista
    const productExists = await this.prisma.product.findUnique({
      where: { id: createDto.productId },
    });
    if (!productExists || productExists.deletedAt) {
      throw new NotFoundException(
        `Product with ID "${createDto.productId}" not found.`,
      );
    }

    // 2. Validar unicidad del SKU
    const skuExists = await this.prisma.productVariant.findUnique({
      where: { sku: createDto.sku },
    });
    if (skuExists) {
      throw new ConflictException(`SKU "${createDto.sku}" is already in use.`);
    }

    return this.prisma.productVariant.create({ data: createDto });
  }

  async findByProduct(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: [{ color: 'asc' }, { size: 'asc' }],
    });
  }

  async update(id: string, updateDto: UpdateProductVariantDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });
    if (!variant) throw new NotFoundException('Variant not found.');

    const updateData: ProductVariantUpdateInput = { ...updateDto };

    // Si modifican el SKU, verificar que no choque con otro
    if (updateDto.sku && updateDto.sku !== variant.sku) {
      const skuConflict = await this.prisma.productVariant.findUnique({
        where: { sku: updateDto.sku },
      });
      if (skuConflict)
        throw new ConflictException(
          `SKU "${updateDto.sku}" is already in use.`,
        );
      updateData.sku = updateDto.sku;
    }

    return this.prisma.productVariant.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true }, // Revisamos si ya se vendió
        },
      },
    });

    if (!variant) throw new NotFoundException('Variant not found.');

    // Regla de negocio: Si ya está en una orden, no podemos borrarla físicamente
    if (variant._count.orderItems > 0) {
      throw new PreconditionFailedException(
        `Cannot delete variant. It is linked to ${variant._count.orderItems} historical order items.`,
      );
    }

    await this.prisma.productVariant.delete({ where: { id } });
  }
}

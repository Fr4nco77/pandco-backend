import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, productId: string) {
    try {
      // Intentamos crear el registro de forma atómica.
      // Si ya existía, la restricción @@unique fallará y saltará al catch para borrarlo (Toggle).
      await this.prisma.wishlist.create({
        data: {
          userId,
          productId,
        },
      });

      return {
        wishlisted: true,
        message: 'Product added to wishlist successfully.',
      };
    } catch (error) {
      // Capturamos el error P2002 de Prisma (Unique constraint failed)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Si ya existía, el "toggle" significa que el usuario quiere removerlo
        await this.prisma.wishlist.delete({
          where: {
            userId_productId: { userId, productId },
          },
        });

        return {
          wishlisted: false,
          message: 'Product removed from wishlist successfully.',
        };
      }

      // Si el error es P2003 (Foreign key constraint failed), significa que el productId enviado no existe
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException(`Product with ID ${productId} not found.`);
      }

      // Si el error es ajeno, se lo deriva a nest
      throw error;
    }
  }

  async findAll(userId: string) {
    const wishlistItems = await this.prisma.wishlist.findMany({
      where: {
        userId,
        product: {
          deletedAt: null,
        },
      },
      select: {
        id: true,
        addedAt: true,
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            discountPrice: true,
            images: {
              where: {
                isMain: true,
              },
              orderBy: {
                order: 'asc',
              },
              take: 3,
              select: {
                id: true,
                url: true,
                color: true,
              },
            },
            variants: {
              select: {
                color: true,
              },
            },
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    return wishlistItems
      .filter((item) => item.product !== null)
      .map((item) => {
        const product = item.product;

        const availableColors = Array.from(
          new Set(product.variants.map((v: { color: string }) => v.color)),
        );

        return {
          wishlistId: item.id,
          productId: product.id,
          addedAt: item.addedAt,
          name: product.name,
          basePrice: product.basePrice,
          discountPrice: product.discountPrice,
          carouselImages: product.images,
          colors: availableColors,
        };
      });
  }

  async remove(userId: string, productId: string) {
    try {
      await this.prisma.wishlist.delete({
        where: {
          userId_productId: { userId, productId },
        },
      });

      return { success: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('The product is not in your wishlist.');
      }
      throw error;
    }
  }
}

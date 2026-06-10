import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { FindAllProductsDto, SortOption } from './dto/findAll-product.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindAllProductsDto) {
    const {
      page,
      limit,
      search,
      category,
      typeSlug,
      collectionSlug,
      tag,
      sortBy,
    } = query;

    // 1. Paginación: Calculamos cuántos registros saltar
    const skip = (page - 1) * limit;

    // 2. Construcción Dinámica del filtro WHERE
    const where: Prisma.ProductWhereInput = {
      // Solo mostramos productos que no han sido borrados (Soft delete)
      deletedAt: null,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    if (typeSlug) {
      // Filtramos navegando hacia la tabla de Types
      where.productType = { slug: typeSlug };
    }

    if (collectionSlug) {
      // Filtramos buscando en la relación N:M (si pertenece a la colección)
      where.collection = { slug: collectionSlug };
    }

    if (tag) {
      // Magia de Postgres: Filtramos dentro del array de strings
      where.tags = { has: tag };
    }

    // 3. Construcción del ORDER BY
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case SortOption.BEST_SELLER:
        orderBy = { salesCount: 'desc' };
        break;
      case SortOption.PRICE_ASC:
        orderBy = { basePrice: 'asc' };
        break;
      case SortOption.PRICE_DESC:
        orderBy = { basePrice: 'desc' };
        break;
      case SortOption.NEWEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // 4. Ejecución paralela (Transacción)
    // Hacemos el count() y el findMany() al mismo tiempo para no bloquear el hilo
    const [totalItems, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        // Incluimos solo lo necesario para pintar la tarjeta del frontend
        include: {
          images: {
            where: { isMain: true }, // Solo traemos la imagen principal para el listado
            take: 3,
          },
          variants: {
            select: { size: true, color: true, stockQuantity: true }, // Info útil para badges de "Sold out"
          },
        },
      }),
    ]);

    // 5. Retornamos la respuesta estructurada con la metadata
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: products,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        // Traemos todas las imágenes ordenadas por su prioridad de visualización
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        // Traemos todas las variantes para armar los selectores de talle/color
        variants: true,
        // Incluimos datos básicos del tipo y colección por si querés mostrar Breadcrumbs (Migas de pan)
        productType: {
          select: {
            name: true,
            slug: true,
          },
        },
        collection: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // 🛡️ Si el producto no existe o fue borrado lógicamente (Soft Delete), lanzamos un 404
    if (!product || product.deletedAt) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    // 1. Generar el slug único a partir del nombre
    const slug = this.createSlug(createProductDto.name);

    // 2. Verificar si el slug ya existe en la base de datos
    const existingProduct = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      throw new ConflictException(
        `A product with the name "${createProductDto.name}" (slug: "${slug}") already exists.`,
      );
    }

    // 3. Insertar el nuevo producto en la base de datos
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        slug,
      },
      // Incluimos las relaciones para que el panel de administración
      // reciba los arrays de imágenes y variantes vacíos listos para ser llenados
      include: {
        images: true,
        variants: true,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // 1. Verificar si el producto existe y no está borrado
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct || existingProduct.deletedAt) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // 2. Preparar los datos para la actualización
    const updateData: Prisma.ProductUpdateInput = { ...updateProductDto };

    // 3. Si cambiaron el nombre, recalculamos el slug dinámicamente
    if (
      updateProductDto.name &&
      updateProductDto.name !== existingProduct.name
    ) {
      const newSlug = this.createSlug(updateProductDto.name);

      // Verificar que el nuevo slug no pertenezca a OTRO producto
      const slugConflict = await this.prisma.product.findFirst({
        where: {
          slug: newSlug,
          NOT: { id }, // Ignora este mismo producto
        },
      });

      if (slugConflict) {
        throw new ConflictException(
          `A product with the generated slug "${newSlug}" already exists.`,
        );
      }

      updateData.slug = newSlug;
    }

    // 4. Actualizar en la base de datos e incluir variantes e imágenes actualizadas
    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        variants: true,
      },
    });
  }

  async softDelete(id: string) {
    // 1. Verificar si el producto existe y no está ya borrado
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // 2. Ejecutar el borrado lógico asentando la fecha actual
    await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private createSlug(name: string) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remueve caracteres especiales
      .replace(/\s+/g, '-'); // Reemplaza espacios por guiones

    return slug;
  }
}

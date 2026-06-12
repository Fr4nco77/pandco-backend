import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto.js';
import { UpdateCollectionDto } from './dto/update-collection.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CollectionUpdateInput } from 'src/generated/prisma/models.js';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CollectionService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createCollectionDto: CreateCollectionDto) {
    const slug = this.generateSlug(createCollectionDto.name);

    const existing = await this.prisma.collection.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(
        `Collection "${createCollectionDto.name}" already exists.`,
      );
    }

    const newCollection = await this.prisma.collection.create({
      data: { ...createCollectionDto, slug },
    });

    // Limpiamos la caché del listado general tras crear
    await this.cacheManager.del('/collection');

    return newCollection;
  }

  async findAll() {
    return this.prisma.collection.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, updateCollectionDto: UpdateCollectionDto) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });
    if (!collection) throw new NotFoundException('Collection not found');

    const updateData: CollectionUpdateInput = { ...updateCollectionDto };

    if (
      updateCollectionDto.name &&
      updateCollectionDto.name !== collection.name
    ) {
      const newSlug = this.generateSlug(updateCollectionDto.name);

      const conflict = await this.prisma.collection.findFirst({
        where: { slug: newSlug, NOT: { id } },
      });
      if (conflict)
        throw new ConflictException(`Slug "${newSlug}" is already in use.`);

      updateData.slug = newSlug;
    }

    const updatedCollection = await this.prisma.collection.update({
      where: { id },
      data: updateData,
    });

    // Limpiamos la caché del listado general tras actualizar
    await this.cacheManager.del('/collection');

    return updatedCollection;
  }

  async remove(id: string) {
    // Impedimos borrar si hay productos vinculados para no romper la integridad
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!collection) throw new NotFoundException('Collection not found');
    if (collection._count.products > 0) {
      throw new PreconditionFailedException(
        `Cannot delete collection. It has ${collection._count.products} associated products.`,
      );
    }

    await this.prisma.collection.delete({ where: { id } });

    // Limpiamos la caché del listado general tras borrar
    await this.cacheManager.del('/collection');
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto.js';
import { UpdateCollectionDto } from './dto/update-collection.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CollectionUpdateInput } from 'src/generated/prisma/models.js';

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.collection.create({
      data: { ...createCollectionDto, slug },
    });
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

    return this.prisma.collection.update({
      where: { id },
      data: updateData,
    });
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
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }
}

import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { CreateTypeDto } from './dto/create-type.dto.js';
import { UpdateTypeDto } from './dto/update-type.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TypeUpdateInput } from '../generated/prisma/models.js';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class TypeService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createTypeDto: CreateTypeDto) {
    const slug = this.generateSlug(createTypeDto.name);

    const existing = await this.prisma.type.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(
        `Type "${createTypeDto.name}" already exists.`,
      );
    }

    const newType = await this.prisma.type.create({
      data: { ...createTypeDto, slug },
    });

    await this.cacheManager.del('/type');

    return newType;
  }

  async findAll() {
    return this.prisma.type.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, updateTypeDto: UpdateTypeDto) {
    const type = await this.prisma.type.findUnique({
      where: { id },
    });
    if (!type) throw new NotFoundException('Type not found');

    const updateData: TypeUpdateInput = { ...updateTypeDto };

    if (updateTypeDto.name && updateTypeDto.name !== type.name) {
      const newSlug = this.generateSlug(updateTypeDto.name);

      const conflict = await this.prisma.type.findFirst({
        where: { slug: newSlug, NOT: { id } },
      });
      if (conflict)
        throw new ConflictException(`Slug "${newSlug}" is already in use.`);

      updateData.slug = newSlug;
    }

    const updatedType = await this.prisma.type.update({
      where: { id },
      data: updateData,
    });

    await this.cacheManager.del('/type');

    return updatedType;
  }

  async remove(id: string) {
    // Impedimos borrar si hay productos vinculados para no romper la integridad referencial
    const type = await this.prisma.type.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!type) throw new NotFoundException('Type not found');
    if (type._count.products > 0) {
      throw new PreconditionFailedException(
        `Cannot delete type. It has ${type._count.products} associated products.`,
      );
    }

    await this.prisma.type.delete({ where: { id } });

    await this.cacheManager.del('/type');
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }
}

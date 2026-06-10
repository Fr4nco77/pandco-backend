import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CollectionService } from './collection.service.js';
import { CreateCollectionDto } from './dto/create-collection.dto.js';
import { UpdateCollectionDto } from './dto/update-collection.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { AdminGuard } from '../common/guards/admin.guard.js';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createCollectionDto: CreateCollectionDto) {
    const collection = await this.collectionService.create(createCollectionDto);
    return {
      message: 'Collection created successfully.',
      data: collection,
    };
  }

  @Get()
  async findAll() {
    const collections = await this.collectionService.findAll();
    return {
      message: 'Collections retrieved successfully.',
      data: collections,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    const collection = await this.collectionService.update(
      id,
      updateCollectionDto,
    );
    return {
      message: 'Collection updated successfully.',
      data: collection,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.collectionService.remove(id);
    return {
      message: 'Collection deleted successfully.',
    };
  }
}

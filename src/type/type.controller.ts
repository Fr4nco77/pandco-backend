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
  UseInterceptors,
} from '@nestjs/common';
import { TypeService } from './type.service.js';
import { CreateTypeDto } from './dto/create-type.dto.js';
import { UpdateTypeDto } from './dto/update-type.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { AdminGuard } from '../common/guards/admin.guard.js';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('type')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createTypeDto: CreateTypeDto) {
    const type = await this.typeService.create(createTypeDto);
    return {
      message: 'Type created successfully.',
      data: type,
    };
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 44)
  async findAll() {
    const types = await this.typeService.findAll();
    return {
      message: 'Types retrieved successfully.',
      data: types,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTypeDto: UpdateTypeDto,
  ) {
    const type = await this.typeService.update(id, updateTypeDto);
    return {
      message: 'Type updated successfully.',
      data: type,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.typeService.remove(id);
    return {
      message: 'Type deleted successfully.',
    };
  }
}

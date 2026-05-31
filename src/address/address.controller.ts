import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AddressService } from './address.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { Request } from 'express';
import PayloadJWT from '../auth/interfaces/payload-jwt.interface.js';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async create(
    @Req() req: Request & { user: PayloadJWT },
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const userId = req.user.id;
    const newAddress = await this.addressService.create(
      userId,
      createAddressDto,
    );

    return {
      message: 'Shipping address saved successfully.',
      data: newAddress,
    };
  }

  @Get()
  async findAll(@Req() req: Request & { user: PayloadJWT }) {
    const userId = req.user.id;
    const addresses = await this.addressService.findAll(userId);

    return {
      message: 'Addresses retrieved successfully.',
      data: addresses,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: PayloadJWT },
  ) {
    const userId = req.user.id;
    const address = await this.addressService.findOne(id, userId);

    return {
      message: 'Address retrieved successfully.',
      data: address,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: PayloadJWT },
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const userId = req.user.id;
    const updatedAddress = await this.addressService.update(
      id,
      userId,
      updateAddressDto,
    );

    return {
      message: 'Address updated successfully.',
      data: updatedAddress,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    const userId = req.user.id;
    await this.addressService.remove(id, userId);

    return {
      message: 'Address deleted successfully.',
    };
  }
}

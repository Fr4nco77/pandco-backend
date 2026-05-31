import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly addressSelect = {
    id: true,
    title: true,
    isDefault: true,
    country: true,
    stateProvince: true,
    city: true,
    postCode: true,
    addressLine1: true,
    addressLine2: true,
    phone: true,
  };

  async create(userId: string, createAddressDto: CreateAddressDto) {
    if (createAddressDto.isDefault) {
      return await this.prisma.$transaction(async (tx) => {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });

        return tx.address.create({
          data: { ...createAddressDto, userId },
          select: this.addressSelect,
        });
      });
    }

    const addressCount = await this.prisma.address.count({ where: { userId } });

    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        userId,
        isDefault: addressCount === 0,
      },
      select: this.addressSelect,
    });
  }

  async findAll(userId: string) {
    return await this.prisma.address.findMany({
      where: { userId },
      select: this.addressSelect,
      orderBy: {
        isDefault: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.prisma.address.findFirst({
      where: {
        id,
        userId,
      },
      select: this.addressSelect,
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found.`);
    }

    return address;
  }

  async update(id: string, userId: string, updateAddressDto: UpdateAddressDto) {
    try {
      // 1. Regla de negocio: Un usuario no puede apagar su dirección por defecto manualmente.
      if (updateAddressDto.isDefault === false) {
        throw new BadRequestException(
          'Cannot unset your default address. You must set another address as default instead.',
        );
      }

      // 2. Si viene `isDefault: true`, ejecutamos el camino con transacción
      if (updateAddressDto.isDefault === true) {
        return await this.prisma.$transaction(async (tx) => {
          // Apagamos la predeterminada actual del usuario
          await tx.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
          });

          // Actualizamos la dirección en cuestión y la hacemos default
          return tx.address.update({
            where: { id },
            data: updateAddressDto,
            select: this.addressSelect,
          });
        });
      }

      // 3. Camino ultra rápido: El usuario solo actualiza datos comunes (calle, teléfono, etc.)
      return await this.prisma.address.update({
        where: { id, userId },
        data: updateAddressDto,
        select: this.addressSelect,
      });
    } catch (error) {
      // Captura el error de Prisma en caso de que el ID no exista
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Address with ID ${id} not found.`);
      }
      // En caso de ser otro tipo de error lo lanza para ser manejado por nest
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
      select: { isDefault: true },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found.`);
    }

    if (address.isDefault) {
      throw new BadRequestException(
        'Cannot delete your default shipping address. Please set another address as default first.',
      );
    }

    await this.prisma.address.delete({
      where: { id },
    });

    return { success: true };
  }
}

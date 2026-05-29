import { Injectable } from '@nestjs/common';
import { CreateUser, UpdateUser } from './interfaces/user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: CreateUser) {
    const newUser = await this.prisma.user.create({ data: userData });
    return newUser;
  }

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user;
  }

  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async update(id: string, updateUser: UpdateUser) {
    return await this.prisma.user.update({
      where: { id },
      data: updateUser,
    });
  }
}

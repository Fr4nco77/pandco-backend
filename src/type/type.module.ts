import { Module } from '@nestjs/common';
import { TypeService } from './type.service.js';
import { TypeController } from './type.controller.js';

@Module({
  controllers: [TypeController],
  providers: [TypeService],
})
export class TypeModule {}

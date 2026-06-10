import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service.js';
import { CollectionController } from './collection.controller.js';

@Module({
  controllers: [CollectionController],
  providers: [CollectionService],
})
export class CollectionModule {}

import { Module } from '@nestjs/common';
import { RestorePasswordService } from './restore-password.service.js';

@Module({
  providers: [RestorePasswordService],
  exports: [RestorePasswordService],
})
export class RestorePasswordModule {}

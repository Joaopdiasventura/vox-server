import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [ConfigModule, BullModule.registerQueue({ name: 'email' })],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

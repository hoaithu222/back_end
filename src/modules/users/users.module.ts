import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';
import { SendEmailService } from '../send-email/send-email.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, SendEmailService],
})
export class UsersModule {}

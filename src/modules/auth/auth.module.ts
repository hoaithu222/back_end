import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';

import { SocialModule } from './social/social.module';
import { SendEmailService } from '../send-email/send-email.service';

@Module({
  imports: [SocialModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, SendEmailService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { PrismaService } from 'src/prisma.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { AuthService } from '../auth.service';

@Module({
  controllers: [SocialController],
  providers: [
    SocialService,
    PrismaService,
    GoogleStrategy,
    FacebookStrategy,
    GitHubStrategy,
    AuthService,
  ],
})
export class SocialModule {}

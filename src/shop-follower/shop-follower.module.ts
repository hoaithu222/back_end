import { Module } from '@nestjs/common';
import { ShopFollowerService } from './shop-follower.service';
import { ShopFollowerController } from './shop-follower.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ShopFollowerController],
  providers: [ShopFollowerService, PrismaService],
})
export class ShopFollowerModule {}

import { Module } from '@nestjs/common';
import { ShopStatisticsService } from './shop-statistics.service';
import { ShopStatisticsController } from './shop-statistics.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ShopStatisticsController],
  providers: [ShopStatisticsService, PrismaService],
})
export class ShopStatisticsModule {}

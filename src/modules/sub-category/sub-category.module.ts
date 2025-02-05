import { Module } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryController } from './sub-category.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SubCategoryController],
  providers: [SubCategoryService, PrismaService],
})
export class SubCategoryModule {}

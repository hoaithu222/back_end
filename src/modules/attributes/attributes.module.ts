import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AttributesController],
  providers: [AttributesService, PrismaService],
})
export class AttributesModule {}

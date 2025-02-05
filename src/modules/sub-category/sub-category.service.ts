import { Injectable } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SubCategoryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(body: CreateSubCategoryDto) {
    const category_id = body.category_id;
    const exitCategoryId = await this.prisma.category.findFirst({
      where: {
        id: +category_id,
      },
    });
    if (!exitCategoryId) {
      throw new Error(` Không tìm thấy danh mục chính với id ${category_id} `);
    }
    return this.prisma.subCategory.create({
      data: {
        ...body,
      },
    });
  }
  async findAll({ page, limit, sort, order, filter = {} }) {
    const skip = (page - 1) * limit;
    const count = await this.prisma.subCategory.count();
    const rows = await this.prisma.subCategory.findMany({
      skip: skip,
      take: limit,
      where: filter,
      include: {
        category: true,
      },
      orderBy: {
        [sort]: order,
      },
    });
    return { count, rows };
  }

  findOne(id: number) {
    return this.prisma.subCategory.findFirst({
      where: {
        id: id,
      },
      include: {
        category: true,
      },
    });
  }

  update(id: number, body: UpdateSubCategoryDto) {
    return this.prisma.subCategory.update({
      where: {
        id: id,
      },
      data: {
        ...body,
      },
    });
  }

  remove(id: number) {
    return this.prisma.subCategory.delete({
      where: {
        id: id,
      },
    });
  }
  async findSubCategory(id: number) {
    const result = await this.prisma.subCategory.findMany({
      where: {
        category_id: id,
      },
      include: {
        products: true,
      },
    });
    if (!result) {
      throw new Error('Lỗi khi lấy dữ liệu từ database');
    }
    return result;
  }
}

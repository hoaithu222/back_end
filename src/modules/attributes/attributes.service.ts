import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo mới một thuộc tính (attribute)
   * @param body Dữ liệu để tạo thuộc tính mới
   */
  async create(body: CreateAttributeDto) {
    try {
      // Sử dụng transaction để đảm bảo tính nhất quán của dữ liệu
      return await this.prisma.$transaction(async (tx) => {
        // Kiểm tra xem các category có tồn tại không
        const categories = await tx.category.findMany({
          where: {
            id: {
              in: body.category_id,
            },
          },
        });

        // Nếu số lượng category tìm thấy không khớp với số lượng category_id được gửi lên
        if (categories.length !== body.category_id.length) {
          throw new BadRequestException(
            'Một hoặc nhiều category ID không hợp lệ',
          );
        }

        // Kiểm tra xem tên thuộc tính đã tồn tại chưa
        const existingAttribute = await tx.attributeType.findFirst({
          where: { name: body.name },
        });

        if (existingAttribute) {
          throw new BadRequestException(`Thuộc tính "${body.name}" đã tồn tại`);
        }

        // 1. Tạo AttributeType và các quan hệ với Category
        const attributeType = await tx.attributeType.create({
          data: {
            name: body.name,
            created_at: new Date(),
            categories: {
              create: body.category_id.map((categoryId) => ({
                category_id: categoryId,
                created_at: new Date(),
              })),
            },
          },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        });

        // 2. Xử lý và tạo các giá trị thuộc tính (AttributeValue)
        const uniqueValues = [...new Set(body.value)]; // Loại bỏ các giá trị trùng lặp
        if (uniqueValues.length !== body.value.length) {
          throw new BadRequestException(
            'Không được phép có giá trị thuộc tính trùng lặp',
          );
        }

        // Tạo các AttributeValue
        const attributeValues = await Promise.all(
          uniqueValues.map((value) =>
            tx.attributeValue.create({
              data: {
                value: value,
                type_id: attributeType.id,
                created_at: new Date(),
              },
            }),
          ),
        );

        // Trả về kết quả với đầy đủ thông tin
        return {
          ...attributeType,
          attribute_values: attributeValues,
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Lỗi thao tác với database: ' + error.message,
        );
      }
      throw error;
    }
  }

  /*
   Lấy danh sách thuộc tính có phân trang
   */
  async findAll({
    page = 1,
    limit = 10,
    sort = 'created_at',
    order = 'desc',
    filter = {},
  }) {
    try {
      const skip = (page - 1) * limit;

      // Kiểm tra tham số phân trang
      if (page < 1 || limit < 1) {
        throw new BadRequestException('Tham số phân trang không hợp lệ');
      }

      // Thực hiện đồng thời việc đếm tổng số bản ghi và lấy dữ liệu
      const [count, rows] = await Promise.all([
        this.prisma.attributeType.count({ where: filter }),
        this.prisma.attributeType.findMany({
          skip,
          take: limit,
          where: filter,
          include: {
            attribute_values: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            [sort]: order,
          },
        }),
      ]);

      // Trả về kết quả với thông tin phân trang
      return {
        count,
        rows,
        pages: Math.ceil(count / limit),
        currentPage: page,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Tham số truy vấn không hợp lệ');
      }
      throw error;
    }
  }

  /*
   Tìm một thuộc tính theo ID
   */
  async findOne(id: number) {
    const attribute = await this.prisma.attributeType.findFirst({
      where: { id },
      include: {
        attribute_values: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!attribute) {
      throw new NotFoundException(`Không tìm thấy thuộc tính với ID ${id}`);
    }

    return attribute;
  }

  /*
   Cập nhật thông tin thuộc tính
   */
  async update(id: number, body: UpdateAttributeDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Kiểm tra thuộc tính tồn tại
        const existingAttribute = await tx.attributeType.findFirst({
          where: { id },
          include: {
            categories: true,
            attribute_values: true,
          },
        });

        if (!existingAttribute) {
          throw new NotFoundException(`Không tìm thấy thuộc tính với ID ${id}`);
        }

        // Nếu có cập nhật categories
        if (body.category_id?.length) {
          // Kiểm tra categories tồn tại
          const categories = await tx.category.findMany({
            where: {
              id: {
                in: body.category_id,
              },
            },
          });

          if (categories.length !== body.category_id.length) {
            throw new BadRequestException(
              'Một hoặc nhiều category ID không hợp lệ',
            );
          }

          // Xóa quan hệ category cũ
          await tx.categoryAttributeType.deleteMany({
            where: { attribute_type_id: id },
          });

          // Tạo quan hệ category mới
          await tx.categoryAttributeType.createMany({
            data: body.category_id.map((categoryId) => ({
              attribute_type_id: id,
              category_id: categoryId,
              created_at: new Date(),
            })),
          });
        }

        // Nếu có cập nhật giá trị thuộc tính
        if (body.value?.length) {
          // Xóa các giá trị cũ
          await tx.attributeValue.deleteMany({
            where: { type_id: id },
          });

          // Tạo các giá trị mới
          await tx.attributeValue.createMany({
            data: body.value.map((value) => ({
              value,
              type_id: id,
              created_at: new Date(),
            })),
          });
        }

        // Cập nhật thông tin thuộc tính
        const updatedAttribute = await tx.attributeType.update({
          where: { id },
          data: {
            name: body.name,
          },
          include: {
            attribute_values: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        });

        return updatedAttribute;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Lỗi thao tác với database: ' + error.message,
        );
      }
      throw error;
    }
  }

  /**
   * Xóa một thuộc tính
   */
  async remove(id: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Kiểm tra thuộc tính tồn tại
        const attribute = await tx.attributeType.findFirst({
          where: { id },
        });

        if (!attribute) {
          throw new NotFoundException(`Không tìm thấy thuộc tính với ID ${id}`);
        }

        // Xóa các bản ghi liên quan trước
        await tx.attributeValue.deleteMany({
          where: { type_id: id },
        });

        await tx.categoryAttributeType.deleteMany({
          where: { attribute_type_id: id },
        });

        // Xóa thuộc tính
        return tx.attributeType.delete({
          where: { id },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Lỗi thao tác với database: ' + error.message,
        );
      }
      throw error;
    }
  }
}

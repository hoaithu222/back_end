import { Injectable } from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(body: any) {
    return this.prisma.category.create({
      data: {
        ...body,
      },
    });
  }

  async findAll({
    page = 1,
    limit = 10,
    sort = 'created_at',
    order = 'desc',
    filter = {},
  }) {
    const skip = (page - 1) * limit;

    const count = await this.prisma.category.count({
      where: filter,
    });

    const rows = await this.prisma.category.findMany({
      skip,
      take: limit,
      where: filter,
      include: {
        sub_categories: {
          include: {
            products: true,
          },
        },
        attributes: {
          include: {
            attribute_type: {
              include: {
                attribute_values: {
                  orderBy: {
                    created_at: 'desc',
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        [sort]: order,
      },
    });

    const formattedRows = this.formatCategoryData(rows);

    return {
      count,
      page,
      totalPages: Math.ceil(count / limit),
      limit,
      rows: formattedRows,
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: id,
      },
      include: {
        sub_categories: {
          include: {
            products: true,
          },
        },
        attributes: {
          include: {
            attribute_type: {
              include: {
                attribute_values: {
                  orderBy: {
                    created_at: 'desc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new Error(`Không tìm thấy category với id ${id}`);
    }

    return this.formatCategoryData([category])[0];
  }

  async getAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        sub_categories: {
          include: {
            products: true,
          },
        },
        attributes: {
          include: {
            attribute_type: {
              include: {
                attribute_values: {
                  orderBy: {
                    created_at: 'desc',
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.formatCategoryData(categories);
  }

  async update(id: number, body: UpdateCategoryDto) {
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        id: id,
      },
    });

    if (!existingCategory) {
      throw new Error(`Không tìm thấy category với id ${id}`);
    }

    const updateCategory = await this.prisma.category.update({
      where: {
        id: id,
      },
      data: {
        ...body,
      },
      include: {
        sub_categories: true,
        attributes: {
          include: {
            attribute_type: {
              include: {
                attribute_values: true,
              },
            },
          },
        },
      },
    });

    return { updateCategory: this.formatCategoryData([updateCategory])[0] };
  }

  remove(id: number) {
    return this.prisma.category.delete({
      where: {
        id: id,
      },
    });
  }

  private formatCategoryData(categories: any[]) {
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon_url: category.icon_url,
      img_banner: category.img_banner,
      meta_title: category.meta_title,
      meta_description: category.meta_description,
      is_active: category.is_active,
      created_at: category.created_at,
      sub_categories: category.sub_categories,
      attributes: category.attributes.map((attr) => ({
        id: attr.attribute_type.id,
        name: attr.attribute_type.name,
        created_at: attr.created_at,
        is_multiple: attr.is_multiple,
        values: attr.attribute_type.attribute_values.map((value) => ({
          id: value.id,
          value: value.value,
          created_at: value.created_at,
        })),
      })),
    }));
  }
}

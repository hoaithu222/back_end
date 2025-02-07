import { Injectable } from '@nestjs/common';
import {
  CreateProductDto,
  ProductAttributeDto,
  ProductImageDto,
  ProductVariantDto,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateProductDto) {
    try {
      const product = await this.prisma.product.create({
        data: {
          shop_id: data.shop_id,
          subcategory_id: data.subcategory_id,
          name: data.name,
          description: data.description,
          base_price: new Prisma.Decimal(data.base_price),
          stock_quantity: data.stock_quantity,
          rating: data.rating || 0,
          sales_count: data.sales_count || 0,
          weight: new Prisma.Decimal(data.weight),
          is_active: data.is_active ?? true,
          category_path: data.category_path,
          product_images: {
            createMany: {
              data: data.product_images.map((image: ProductImageDto) => ({
                image_url: image.image_url,
                display_order: image.display_order,
                is_thumbnail: image.is_thumbnail,
              })),
            },
          },
          product_attributes: {
            createMany: {
              data: data.product_attributes.map(
                (attr: ProductAttributeDto) => ({
                  attribute_value_id: attr.attribute_value_id,
                }),
              ),
            },
          },
          product_variants: {
            createMany: {
              data: data.product_variants.map((variant: ProductVariantDto) => ({
                sku: `${variant.sku}-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                combination: variant.combination,
                price: new Prisma.Decimal(Math.round(variant.price)),
                stock: variant.stock,
                image_url: variant.image_url,
              })),
            },
          },
        },
        include: {
          product_images: true,
          product_attributes: true,
          product_variants: true,
          shop: true,
          sub_category: true,
          Review: true,
        },
      });
      product.product_variants = product.product_variants.map((variant) => ({
        ...variant,
        sku: variant.sku.split('-')[0],
      }));

      return {
        success: true,
        data: product,
        message: 'Tạo sản phẩm thành công',
      };
    } catch (error) {
      throw new Error(error.message || 'Lỗi khi tạo sản phẩm');
    }
  }

  async findAll({ page, limit, sort, order, filter = {} }) {
    const skip = (page - 1) * limit;
    const count = await this.prisma.product.count();
    const rows = await this.prisma.product.findMany({
      skip: skip,
      take: limit,
      where: filter,
      include: {
        product_images: true,
        product_attributes: true,
        product_variants: true,
        shop: true,
        sub_category: true,
        Review: true,
      },
      orderBy: {
        [sort]: order,
      },
    });
    rows.forEach((product) => {
      product.product_variants = product.product_variants.map((variant) => ({
        ...variant,
        sku: variant.sku.split('-')[0],
      }));
    });
    return { count, rows };
  }

  async findOne(id: number) {
    try {
      const productId = await this.prisma.product.findFirst({
        where: {
          id: id,
        },
        include: {
          product_images: true,
          product_attributes: true,
          product_variants: true,
          shop: true,
          sub_category: true,
          Review: true,
        },
      });

      if (!productId) {
        throw new Error('Lỗi khi lấy dữ liệu từ server');
      }
      productId.product_variants = productId.product_variants.map(
        (variant) => ({
          ...variant,
          sku: variant.sku.split('-')[0],
        }),
      );
      return productId;
    } catch (error) {
      throw new Error(`Đã xảy ra lỗi ${error}`);
    }
  }

  async update(id: number, body: UpdateProductDto) {
    try {
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new Error('Sản phẩm không tồn tại');
      }

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          shop_id: body.shop_id,
          subcategory_id: body.subcategory_id,
          name: body.name,
          description: body.description,
          base_price: body.base_price
            ? new Prisma.Decimal(body.base_price)
            : undefined,
          stock_quantity: body.stock_quantity,
          rating: body.rating,
          sales_count: body.sales_count,
          is_active: body.is_active,
          category_path: body.category_path,
          ...(body.product_images && {
            product_images: {
              deleteMany: {},
              createMany: {
                data: body.product_images.map((image) => ({
                  image_url: image.image_url,
                  display_order: image.display_order,
                  is_thumbnail: image.is_thumbnail,
                })),
              },
            },
          }),

          ...(body.product_attributes && {
            product_attributes: {
              deleteMany: {},
              createMany: {
                data: body.product_attributes.map((attr) => ({
                  attribute_value_id: attr.attribute_value_id,
                })),
              },
            },
          }),

          ...(body.product_variants && {
            product_variants: {
              deleteMany: {},
              createMany: {
                data: body.product_variants.map((variant) => ({
                  sku: `${variant.sku}-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                  combination: variant.combination,
                  price: new Prisma.Decimal(Math.round(variant.price)),
                  stock: variant.stock,
                  image_url: variant.image_url,
                })),
              },
            },
          }),
        },
        include: {
          product_images: true,
          product_attributes: true,
          product_variants: true,
          shop: true,
          sub_category: true,
          Review: true,
        },
      });
      updatedProduct.product_variants = updatedProduct.product_variants.map(
        (variant) => ({
          ...variant,
          sku: variant.sku.split('-')[0],
        }),
      );

      return {
        success: true,
        data: updatedProduct,
        message: 'Cập nhật sản phẩm thành công',
      };
    } catch (error) {
      throw new Error(error.message || 'Lỗi khi cập nhật sản phẩm');
    }
  }

  async remove(id: number) {
    try {
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new Error('Sản phẩm không tồn tại');
      }

      const deletedProduct = await this.prisma.product.delete({
        where: { id },
        include: {
          product_images: true,
          product_attributes: true,
          product_variants: true,
        },
      });

      return {
        success: true,
        data: deletedProduct,
        message: 'Xóa sản phẩm thành công',
      };
    } catch (error) {
      throw new Error(error.message || 'Lỗi khi xóa sản phẩm');
    }
  }
  async getProductWithShop({ page, limit, sort, order, filter, id }) {
    try {
      const skip = (page - 1) * limit;

      const count = await this.prisma.product.count({
        where: { shop_id: id },
      });

      const rows = await this.prisma.product.findMany({
        skip,
        take: limit,
        where: filter,
        include: {
          product_images: true,
          product_attributes: true,
          product_variants: true,
          shop: true,
          sub_category: true,
          Review: true,
        },
        orderBy: {
          [sort]: order,
        },
      });

      rows.forEach((product) => {
        product.product_variants = product.product_variants.map((variant) => ({
          ...variant,
          sku: variant.sku.split('-')[0],
        }));
      });

      return { count, rows };
    } catch (error) {
      throw new Error(error.message || 'Lỗi khi lấy sản phẩm của shop');
    }
  }
  async getProductWithSubCategory({ page, limit, order, sort, body }) {
    try {
      const skip = (page - 1) * limit;

      const count = await this.prisma.product.count({
        where: {
          subcategory_id: { in: body },
        },
      });

      const rows = await this.prisma.product.findMany({
        skip,
        take: limit,
        where: {
          subcategory_id: { in: body },
        },
        include: {
          product_images: true,
          product_attributes: true,
          product_variants: true,
          shop: true,
          sub_category: true,
          Review: true,
        },
        orderBy: {
          [sort]: order,
        },
      });
      rows.forEach((product) => {
        product.product_variants = product.product_variants.map((variant) => ({
          ...variant,
          sku: variant.sku.split('-')[0],
        }));
      });

      return { count, rows };
    } catch (error) {
      throw new Error(error.message || 'Lỗi khi lấy sản phẩm');
    }
  }
}

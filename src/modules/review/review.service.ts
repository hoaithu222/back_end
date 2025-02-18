import { Injectable } from '@nestjs/common';
import { CreateReviewDto, ReviewImage } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  // cập nhật rating của  shop
  async updateShopRating(shopId: number) {
    const shopProducts = await this.prisma.product.findMany({
      where: {
        shop_id: shopId,
      },
      select: {
        rating: true,
        id: true,
        _count: {
          select: {
            Review: true,
          },
        },
      },
    });
    let totalRating = 0;
    let totalReview = 0;
    shopProducts.forEach((product) => {
      totalRating += (product.rating || 0) * product._count.Review;
      totalReview += product._count.Review;
    });
    const newShopRating = totalReview > 0 ? totalRating / totalReview : 0;
    await this.prisma.shop.update({
      where: {
        id: shopId,
      },
      data: {
        rating: newShopRating,
      },
    });
    return newShopRating;
  }
  async create(userId: number, body: CreateReviewDto) {
    try {
      const exitOrder = await this.prisma.order.findFirst({
        where: {
          id: body.order_id,
        },
      });
      if (!exitOrder) {
        throw new Error('Đơn hàng không tồn tại');
      }
      const review = await this.prisma.review.create({
        data: {
          user_id: userId,
          product_id: body.product_id,
          order_id: body.order_id,
          rating: body.rating,
          comment: body.comment || '',
          ReviewImage: {
            createMany: {
              data: body.ReviewImage.map((image: ReviewImage) => ({
                image_url: image.image_url,
              })),
            },
          },
        },
        include: {
          user: true,
          product: {
            include: {
              product_images: true,
            },
          },
          ReviewImage: true,
        },
      });
      // cập nhật rating của sản phẩm
      const avgRating = await this.prisma.review.aggregate({
        where: {
          product_id: body.product_id,
        },
        _avg: {
          rating: true,
        },
      });
      const updateProduct = await this.prisma.product.update({
        where: {
          id: body.product_id,
        },
        data: {
          rating: avgRating._avg.rating || 0,
        },
      });
      await this.prisma.order.update({
        where: {
          id: body.order_id,
        },
        data: {
          is_review: true,
        },
      });
      await this.updateShopRating(updateProduct.shop_id);
      return review;
    } catch (error) {
      throw new Error(error);
    }
  }

  findAll() {
    return `This action returns all review`;
  }

  async findOne(id: number) {
    const review = await this.prisma.review.findFirst({
      where: {
        id: id,
      },
      include: {
        user: true,
        product: {
          include: {
            product_images: true,
          },
        },
        ReviewImage: true,
      },
    });
    if (!review) {
      throw new Error(`Khong tìm thấy danh giá với ID : ${id} `);
    }
    return review;
  }

  async update(id: number, userId: number, body: UpdateReviewDto) {
    try {
      const existingReview = await this.prisma.review.findFirst({
        where: {
          id: id,
          user_id: userId,
        },
      });

      if (!existingReview) {
        throw new Error(
          'Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa',
        );
      }

      const review = await this.prisma.review.update({
        where: {
          id: id,
        },
        data: {
          rating: body.rating,
          comment: body.comment,
          ReviewImage: {
            deleteMany: {},
            createMany: {
              data: (body.ReviewImage || []).map((image: ReviewImage) => ({
                image_url: image.image_url,
              })),
            },
          },
        },
        include: {
          user: true,
          product: {
            include: {
              product_images: true,
            },
          },
          ReviewImage: true,
        },
      });

      const avgRating = await this.prisma.review.aggregate({
        where: {
          product_id: existingReview.product_id,
        },
        _avg: {
          rating: true,
        },
      });

      const updateProduct = await this.prisma.product.update({
        where: {
          id: existingReview.product_id,
        },
        data: {
          rating: avgRating._avg.rating || 0,
        },
      });

      await this.updateShopRating(updateProduct.shop_id);
      return review;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async remove(id: number) {
    try {
      const existingReview = await this.prisma.review.findFirst({
        where: {
          id: id,
        },
      });

      if (!existingReview) {
        throw new Error('Không tìm thấy đánh giá ');
      }

      await this.prisma.reviewImage.deleteMany({
        where: {
          review_id: id,
        },
      });

      await this.prisma.review.delete({
        where: {
          id: id,
        },
      });

      const avgRating = await this.prisma.review.aggregate({
        where: {
          product_id: existingReview.product_id,
        },
        _avg: {
          rating: true,
        },
      });

      const updateProduct = await this.prisma.product.update({
        where: {
          id: existingReview.product_id,
        },
        data: {
          rating: avgRating._avg.rating || 0,
        },
      });

      await this.updateShopRating(updateProduct.shop_id);
      return { message: 'Xóa đánh giá thành công' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAllByShop(shopId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          product: {
            shop_id: shopId,
          },
        },
        include: {
          user: true,
          product: {
            include: {
              product_images: true,
            },
          },
          ReviewImage: true,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.review.count({
        where: {
          product: {
            shop_id: shopId,
          },
        },
      }),
    ]);

    return {
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllByUser(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          user_id: userId,
        },
        include: {
          product: {
            include: {
              product_images: true,
            },
          },
          ReviewImage: true,
          user: {
            select: {
              username: true,
              avatar_url: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.review.count({
        where: {
          user_id: userId,
        },
      }),
    ]);

    return {
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getReviewWithOrder(orderId: number) {
    const data = await this.prisma.review.findMany({
      where: {
        order_id: orderId,
      },
      include: {
        product: {
          include: {
            product_images: true,
          },
        },
        ReviewImage: true,
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
        order: {
          include: {
            order_items: {
              include: {
                product: true,
                product_variant: true,
              },
            },
          },
        },
      },
    });
    if (!data) {
      throw new Error(`Không tìm thấy đánh giá với id ${orderId}`);
    }
    return data;
  }
}

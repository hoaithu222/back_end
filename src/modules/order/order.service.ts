import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma.service';
import { OrderStatus } from '@prisma/client';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateOrderDto, user_id: number) {
    try {
      const createOrder = await this.prisma.$transaction(async (tx) => {
        for (const product of body.products) {
          const currentProduct = await tx.product.findUnique({
            where: { id: product.product_id },
          });

          if (!currentProduct) {
            throw new Error(
              `Không tồn tại sản phẩm vói ID :  ${product.product_id}`,
            );
          }

          if (currentProduct.stock_quantity < product.quantity) {
            throw new Error(
              `Số lượng sản phẩm ${currentProduct.name} không đủ`,
            );
          }
        }
        const order = await tx.order.create({
          data: {
            user_id,
            shop_id: body.shop_id,
            total_amount: body.total_amount,
            shipping_fee: body.shipping_fee,
            status: body.status || OrderStatus.pending,
            address_id: body.address_id,
            payment_method: body.payment_method,
            tracking_number: body.tracking_number,
            courier_name: body.courier_name,
            notes: body.notes,
            voucher_id: body.voucher_id,
            discount_amount: body.discount_amount || 0,
            cancellation_reason: body.cancellation_reason,
          },
        });

        const orderItemPromises = body.products.map(async (product) => {
          const orderItem = await tx.orderItem.create({
            data: {
              order_id: order.id,
              variant_id: product.variant_id,
              product_id: product.product_id,
              quantity: product.quantity,
              unit_price: product.unit_price,
              subtotal: product.subtotal,
            },
          });
          await tx.product.update({
            where: { id: product.product_id },
            data: {
              stock_quantity: {
                decrement: product.quantity,
              },
              sales_count: {
                increment: product.quantity,
              },
            },
          });
          await tx.cartItem.deleteMany({
            where: {
              product_id: product.product_id,
            },
          });

          if (product.variant_id) {
            await tx.productVariant.update({
              where: { id: product.variant_id },
              data: {
                stock: {
                  decrement: product.quantity,
                },
              },
            });
            await tx.cartItem.deleteMany({
              where: {
                variant_id: product.variant_id,
              },
            });
          }

          return orderItem;
        });
        await Promise.all(orderItemPromises);

        await tx.orderHistory.create({
          data: {
            order_id: order.id,
            status: body.status || OrderStatus.pending,
            description: 'Đơn hàng đang chờ xử lý',
          },
        });

        return tx.order.findFirst({
          where: { id: order.id },
          include: {
            order_items: {
              include: {
                product: true,
                product_variant: true,
              },
            },
            order_history: true,
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
            shop_voucher: true,
          },
        });
      });

      return createOrder;
    } catch (error) {
      throw new Error(
        error.message || 'An error occurred while creating the order',
      );
    }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.order.findUnique({
        where: { id },
        include: {
          order_items: {
            include: {
              product: {
                include: {
                  product_images: true,
                },
              },
              product_variant: true,
            },
          },
          order_history: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
              logo_url: true,
            },
          },
          shop_voucher: true,
        },
      });
    } catch (error) {
      throw new Error(error.message || 'Đã xảy ra lỗi');
    }
  }
  async findOrderWithUser(userId: number, status: OrderStatus[]) {
    try {
      const data = await this.prisma.order.findMany({
        where: {
          user_id: userId,
          status: {
            in: status,
          },
        },
        include: {
          order_items: {
            include: {
              product: {
                include: {
                  product_images: true,
                },
              },
              product_variant: true,
            },
          },
          order_history: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
              logo_url: true,
            },
          },
          shop_voucher: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
      if (!data) {
        throw new Error('đã có lỗi xảy ra vui long thử lại sau');
      }
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }
  async findOrderWithShop(shopId: number, status: OrderStatus[]) {
    try {
      const count = await this.prisma.order.count({
        where: {
          shop_id: shopId,
          status: {
            in: status,
          },
        },
      });
      const data = await this.prisma.order.findMany({
        where: {
          shop_id: shopId,
          status: {
            in: status,
          },
        },
        include: {
          order_items: {
            include: {
              product: {
                include: {
                  product_images: true,
                },
              },
              product_variant: true,
            },
          },
          order_history: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar_url: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
              logo_url: true,
            },
          },
          shop_voucher: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
      if (!data) {
        throw new Error('đã có lỗi xảy ra vui long thử lại sau');
      }
      return { data, count };
    } catch (error) {
      throw new Error(error);
    }
  }
  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
    user: CreateUserDto,
  ) {
    try {
      const existingOrder = await this.prisma.order.findUnique({
        where: { id },
        include: {
          shop: true,
        },
      });

      if (!existingOrder) {
        throw new Error('Không tìm thấy đơn hàng');
      }

      const allowedStatusTransitions = {
        Shop: {
          pending: ['processing', 'cancelled'],
          processing: ['shipped', 'cancelled'],
          shipped: ['delivered', 'cancelled'],
          delivered: [],
          cancelled: [],
        },
        Admin: {
          pending: ['processing', 'shipped', 'delivered', 'cancelled'],
          processing: ['shipped', 'delivered', 'cancelled'],
          shipped: ['delivered', 'cancelled'],
          delivered: ['cancelled'],
          cancelled: ['pending'],
        },
      };

      if (updateOrderDto.status) {
        const currentStatus = existingOrder.status;
        const allowedStatuses =
          allowedStatusTransitions[user.role]?.[currentStatus] || [];

        if (!allowedStatuses.includes(updateOrderDto.status)) {
          throw new Error(
            `Không thể chuyển trạng thái từ ${currentStatus} sang  ${updateOrderDto.status} `,
          );
        }
      }

      return await this.prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: { id },
          data: {
            ...updateOrderDto,
            updated_at: new Date(),
          },
        });

        if (updateOrderDto.status) {
          await tx.orderHistory.create({
            data: {
              order_id: id,
              status: updateOrderDto.status,
              description: this.getStatusDescription(updateOrderDto.status),
            },
          });
        }

        return updatedOrder;
      });
    } catch (error) {
      throw new Error(
        error.message || 'An error occurred while updating the order',
      );
    }
  }
  private getStatusDescription(status: OrderStatus): string {
    const statusDescriptions = {
      pending: 'Đơn hàng đang chờ xử lý',
      processing: 'Đơn hàng đang được xử lý',
      shipped: 'Đơn hàng đã được gửi đi',
      delivered: 'Đơn hàng đã được giao thành công',
      cancelled: 'Đơn hàng đã bị hủy',
    };
    return statusDescriptions[status] || 'Cập nhật trạng thái đơn hàng';
  }
}

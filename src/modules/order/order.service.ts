import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateOrderDto, user_id: number) {
    try {
      const createOrder = await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            user_id: user_id,
            shop_id: body.shop_id,
            total_amount: body.total_amount,
            shipping_fee: body.shipping_fee,
            address_id: body.address_id,
            payment_method: body.payment_method,
            status: 'pending',
          },
        });

        const orderItem = await tx.orderItem.create({
          data: {
            order_id: order.id,
            variant_id: body.variant_id,
            product_id: body.product_id,
            quantity: body.quantity,
            unit_price: body.unit_price,
            subtotal: body.subtotal,
          },
        });

        const orderHistory = await tx.orderHistory.create({
          data: {
            order_id: order.id,
            status: 'pending',
            description: 'Đơn hàng đang chuẩn bị',
          },
        });

        if (body.cart_id) {
          await tx.cart.update({
            where: { id: body.cart_id },
            data: { status: 'COMPLETED' },
          });
        }

        return tx.order.findUnique({
          where: { id: order.id },
          include: {
            order_items: true,
            order_history: true,
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

  async findAll() {
    try {
      return await this.prisma.order.findMany({
        include: {
          order_items: true,
          order_history: true,
        },
      });
    } catch (error) {
      throw new Error(
        error.message || 'An error occurred while fetching orders',
      );
    }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.order.findUnique({
        where: { id },
        include: {
          order_items: true,
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
        },
      });
    } catch (error) {
      throw new Error(
        error.message || 'An error occurred while fetching the order',
      );
    }
  }

  // async update(id: number, updateOrderDto: UpdateOrderDto) {
  //   try {
  //     return await this.prisma.$transaction(async (tx) => {
  //       const updatedOrder = await tx.order.update({
  //         where: { id },
  //         data: {
  //           status: updateOrderDto.status,
  //           shipping_fee: updateOrderDto.shipping_fee,
  //           payment_method: updateOrderDto.payment_method,
  //           address_id: updateOrderDto.address_id,
  //         },
  //       });

  //       await tx.orderHistory.create({
  //         data: {
  //           order_id: id,
  //           status: updateOrderDto.status || updatedOrder.status,
  //           description: `Order updated to ${
  //             updateOrderDto.status || updatedOrder.status
  //           }`,
  //         },
  //       });

  //       return tx.order.findUnique({
  //         where: { id },
  //         include: {
  //           order_items: true,
  //           order_history: true,
  //         },
  //       });
  //     });
  //   } catch (error) {
  //     throw new Error(
  //       error.message || 'An error occurred while updating the order',
  //     );
  //   }
  // }

  async remove(id: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.orderHistory.deleteMany({
          where: { order_id: id },
        });

        await tx.orderItem.deleteMany({
          where: { order_id: id },
        });

        return tx.order.delete({
          where: { id },
        });
      });
    } catch (error) {
      throw new Error(
        error.message || 'An error occurred while deleting the order',
      );
    }
  }
}

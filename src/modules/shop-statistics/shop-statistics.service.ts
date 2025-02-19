import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ShopStatisticsService {
  constructor(private readonly prisma: PrismaService) {}
  async getOverview(shopId: number) {
    // Doanh thu của cửa hàng
    const revenue = await this.prisma.order.aggregate({
      _sum: {
        total_amount: true,
      },
      where: {
        shop_id: shopId,
        status: 'delivered',
      },
    });
    // Số lượng đơn hàng
    const order = await this.prisma.order.count({
      where: {
        shop_id: shopId,
      },
    });
    // Số lượng đơn hàng theo trạng thái của từng cửa hàng
    const OrdersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { shop_id: shopId },
    });
    const totalProduct = await this.prisma.product.count({
      where: {
        shop_id: shopId,
      },
    });
    return { revenue, order, OrdersByStatus, totalProduct };
  }
  // Doanh thu theo tháng của shop
  async getRevenueByMonth(shopId: number) {
    const revenueByMonth = await this.prisma.order.groupBy({
      by: ['created_at'],
      _sum: { total_amount: true },
      where: { shop_id: shopId, status: 'delivered' },
      orderBy: { created_at: 'asc' },
    });

    return revenueByMonth.map((data) => ({
      month: data.created_at.toISOString().slice(0, 7),
      revenue: data._sum.total_amount || 0,
    }));
  }
}

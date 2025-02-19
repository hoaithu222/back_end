import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  // Thống kê thông tin chung

  async getOverview() {
    try {
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );
      const totalOrders = await this.prisma.order.count();
      const totalRevenue = await this.prisma.order.aggregate({
        _sum: { total_amount: true },
        where: { status: 'delivered' },
      });

      const totalUsers = await this.prisma.user.count();
      const totalProducts = await this.prisma.product.count();
      const totalShop = await this.prisma.shop.count();
      const getNewCustomers = await this.prisma.user.count({
        where: { created_at: { gte: startOfMonth } },
      });

      return {
        totalOrders,
        totalRevenue: totalRevenue._sum.total_amount || 0,
        totalUsers,
        totalProducts,
        getNewCustomers,
        totalShop,
      };
    } catch (error) {
      throw new Error(`Lỗi lấy dữ liệu thống kê: ${error.message}`);
    }
  }

  // Thống kê đơn hàng theo trạng thái và doanh thu theo ngày
  async getOrder() {
    try {
      const orderByStatus = await this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      const revenueByDate = await this.prisma.order.groupBy({
        by: ['created_at'],
        _sum: { total_amount: true },
      });
      const ordersByMonth = await this.prisma.order.groupBy({
        by: ['created_at'],
        _count: { id: true },
        orderBy: { created_at: 'asc' },
      });
      // Đếm số lượng đơn hàng theo từng tháng
      return { orderByStatus, revenueByDate, ordersByMonth };
    } catch (error) {
      throw new Error(`Lỗi lấy dữ liệu: ${error.message}`);
    }
  }

  // Lấy danh sách sản phẩm bán chạy nhất
  async getBestSellingProducts() {
    const bestSelling = await this.prisma.orderItem.groupBy({
      by: ['product_id'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    // Lấy thông tin chi tiết của sản phẩm
    const productIds = bestSelling.map((item) => item.product_id);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        base_price: true,
        product_images: true,
        sales_count: true,
      },
    });

    // Kết hợp dữ liệu
    return bestSelling.map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.product_id) || null,
    }));
  }

  // Lấy khách hàng có giá trị đơn hàng cao nhất
  async getTopCustomers() {
    const topCustomers = await this.prisma.order.groupBy({
      by: ['user_id'],
      _sum: { total_amount: true },
      orderBy: { _sum: { total_amount: 'desc' } },
      take: 5,
    });

    // Lấy thông tin chi tiết của user
    const userIds = topCustomers.map((item) => item.user_id);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, email: true, avatar_url: true },
    });

    // Kết hợp dữ liệu
    return topCustomers.map((item) => ({
      ...item,
      user: users.find((u) => u.id === item.user_id) || null,
    }));
  }

  // Tính tỷ lệ đơn hàng bị hủy
  async getCancelledOrderRate() {
    const totalOrders = await this.prisma.order.count();
    const cancelledOrders = await this.prisma.order.count({
      where: { status: 'cancelled' },
    });

    return {
      cancelledOrders,
      totalOrders,
      cancellationRate:
        totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0,
    };
  }
  // doanh thu theo tháng
  async getRevenueByMonth() {
    try {
      const revenueByMonth = await this.prisma.order.groupBy({
        by: ['created_at'],
        _sum: { total_amount: true },
        orderBy: { created_at: 'asc' },
      });

      const formattedRevenue = revenueByMonth.map((data) => ({
        month: data.created_at.toISOString().slice(0, 7),
        revenue: data._sum.total_amount || 0,
      }));

      return formattedRevenue;
    } catch (error) {
      throw new Error(`Lỗi lấy dữ liệu doanh thu theo tháng: ${error.message}`);
    }
  }
  // thống kê người dùng và đơn hàng
  async getOrdersAndUsersByMonth() {
    try {
      const ordersByMonth = await this.prisma.order.groupBy({
        by: ['created_at'],
        _count: { id: true },
        orderBy: { created_at: 'asc' },
      });

      const usersByMonth = await this.prisma.user.groupBy({
        by: ['created_at'],
        _count: { id: true },
        orderBy: { created_at: 'asc' },
      });

      const formattedData = {};

      ordersByMonth.forEach((order) => {
        const month = order.created_at.toISOString().slice(0, 7);
        if (!formattedData[month]) {
          formattedData[month] = { month, orders: 0, users: 0 };
        }
        formattedData[month].orders = order._count.id;
      });

      usersByMonth.forEach((user) => {
        const month = user.created_at.toISOString().slice(0, 7);
        if (!formattedData[month]) {
          formattedData[month] = { month, orders: 0, users: 0 };
        }
        formattedData[month].users = user._count.id;
      });

      return Object.values(formattedData);
    } catch (error) {
      throw new Error(
        `Lỗi lấy dữ liệu đơn hàng & người dùng theo tháng: ${error.message}`,
      );
    }
  }
}

import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  async getOverview(@Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user || user.role !== 'Admin') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền lấy thông tin',
          error: true,
          success: false,
        });
      }

      const data = await this.statisticsService.getOverview();
      return res.status(HttpStatus.OK).json({
        message: 'Lấy thông tin thành công',
        error: false,
        success: true,
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra',
        error: true,
        success: false,
      });
    }
  }

  @Get('orders')
  async getOrder(@Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user || user.role !== 'Admin') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền lấy thông tin',
          error: true,
          success: false,
        });
      }

      const data = await this.statisticsService.getOrder();
      return res.status(HttpStatus.OK).json({
        message: 'Lấy thông tin thành công',
        error: false,
        success: true,
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra',
        error: true,
        success: false,
      });
    }
  }

  @Get('best-selling-products')
  async getBestSellingProducts(@Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user || user.role !== 'Admin') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền lấy thông tin',
          error: true,
          success: false,
        });
      }

      const data = await this.statisticsService.getBestSellingProducts();
      return res.status(HttpStatus.OK).json({
        message: 'Lấy thông tin thành công',
        error: false,
        success: true,
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra',
        error: true,
        success: false,
      });
    }
  }

  @Get('top-customers')
  async getTopCustomers(@Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user || user.role !== 'Admin') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền lấy thông tin',
          error: true,
          success: false,
        });
      }

      const data = await this.statisticsService.getTopCustomers();
      return res.status(HttpStatus.OK).json({
        message: 'Lấy thông tin thành công',
        error: false,
        success: true,
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra',
        error: true,
        success: false,
      });
    }
  }

  @Get('cancelled-orders-rate')
  async getCancelledOrderRate(@Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user || user.role !== 'Admin') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền lấy thông tin',
          error: true,
          success: false,
        });
      }

      const data = await this.statisticsService.getCancelledOrderRate();
      return res.status(HttpStatus.OK).json({
        message: 'Lấy thông tin thành công',
        error: false,
        success: true,
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra',
        error: true,
        success: false,
      });
    }
  }
  @Get('revenue-by-month')
  async getRevenueByMonth(@Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user || user.role !== 'Admin') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền lấy thông tin',
          error: true,
          success: false,
        });
      }

      const data = await this.statisticsService.getRevenueByMonth();
      return res.status(HttpStatus.OK).json({
        message: 'Lấy thông tin thành công',
        error: false,
        success: true,
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra',
        error: true,
        success: false,
      });
    }
  }
  @Get('orders-users-month')
  async getOrdersAndUsersByMonth(@Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user || user.role !== 'Admin') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền lấy thông tin',
          error: true,
          success: false,
        });
      }

      const data = await this.statisticsService.getOrdersAndUsersByMonth();
      return res.status(HttpStatus.OK).json({
        message: 'Lấy thông tin thành công',
        error: false,
        success: true,
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra',
        error: true,
        success: false,
      });
    }
  }
}

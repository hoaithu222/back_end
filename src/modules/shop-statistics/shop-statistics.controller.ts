import { Controller, Get, HttpStatus, Param, Req, Res } from '@nestjs/common';
import { ShopStatisticsService } from './shop-statistics.service';

@Controller('shop-statistics')
export class ShopStatisticsController {
  constructor(private readonly shopStatisticsService: ShopStatisticsService) {}
  @Get(':id')
  async getOverviewWithShop(@Param('id') id: string, @Res() res, @Req() req) {
    try {
      const user = req.user;
      if (user.role === 'User') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền',
          error: true,
          success: false,
        });
      }
      const data = await this.shopStatisticsService.getOverview(+id);
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Bạn đã lấy thông tin thành công',
        error: false,
        success: true,
        data: data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thủ sau',
        error: true,
        success: false,
      });
    }
  }
  @Get('revenue-by-month/:id')
  async getRevenueByMonth(@Param('id') id: string, @Res() res, @Req() req) {
    try {
      const user = req.user;
      if (user.role === 'User') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền',
          error: true,
          success: false,
        });
      }

      const data = await this.shopStatisticsService.getRevenueByMonth(+id);
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

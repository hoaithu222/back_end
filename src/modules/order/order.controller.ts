import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('items')
  async create(@Body() body: CreateOrderDto, @Res() res, @Req() req) {
    const user = req.user;
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Vui lòng đăng nhập để thực hiện',
        error: true,
        success: false,
      });
    }
    try {
      const newOrder = await this.orderService.create(body, +user.id);
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Đã tạo đơn hàng thành công',
        error: false,
        success: true,
        data: newOrder,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_GATEWAY).json({
        message: error.message || 'Đã có lỗi xảy ra',
        error: true,
        success: false,
      });
    }
  }
  @Post('my-order')
  async findOrderWithUser(@Res() res, @Req() req, @Body() body) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Vui lòng đăng nhập để tiếp tục',
          error: true,
          success: false,
        });
      }
      const { data, statusCounts } = await this.orderService.findOrderWithUser(
        user.id,
        body,
      );
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Lấy danh sách đơn hàng thành công',
        success: true,
        error: false,
        data: data,
        statusCounts: statusCounts,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }
  @Post('shop')
  async findOrderWithShop(@Res() res, @Req() req, @Body() body) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Vui lòng đăng nhập để tiếp tục',
          error: true,
          success: false,
        });
      }
      const { data, count, statusCounts } =
        await this.orderService.findOrderWithShop(user.Shop.id, body);
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Lấy danh sách đơn hàng thành công',
        success: true,
        error: false,
        data: data,
        count: count,
        statusCounts: statusCounts,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Vui lòng đăng nhập để tiếp tục',
          error: true,
          success: false,
        });
      }
      const orderItem = await this.orderService.findOne(+id);
      return res.status(HttpStatus.ACCEPTED).json({
        message: `Lấy order với ID ${id} thành công`,
        error: false,
        success: true,
        data: orderItem,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateOrderDto,
    @Res() res,
    @Req() req,
  ) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Vui lòng đăng nhập để tiếp tục',
          error: true,
          success: false,
        });
      }

      if (user.role != 'Shop' && user.role != 'Admin') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền',
          error: true,
          success: false,
        });
      }
      const dataUpdate = await this.orderService.update(+id, body, user);
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Đã cập nhật thành công',
        error: false,
        success: true,
        data: dataUpdate,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã có lỗi xảy ra vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }
}

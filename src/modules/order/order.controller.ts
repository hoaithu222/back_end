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

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}

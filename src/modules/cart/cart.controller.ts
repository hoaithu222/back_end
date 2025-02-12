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
import { CartService } from './cart.service';

import { UpdateCartDto } from './dto/update-cart.dto';
import { CreateCartDto } from './dto/create-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  async addToCart(@Body() body: CreateCartDto, @Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Vui lòng đăng nhập để thực hiện chức năng này',
          error: true,
          success: false,
        });
      }

      const result = await this.cartService.addToCart(user.id, body);

      const message =
        result.action === 'CREATE'
          ? 'Thêm sản phẩm vào giỏ hàng thành công'
          : `Cập nhật số lượng sản phẩm từ ${result.previousQuantity} thành ${result.newQuantity}`;

      return res.status(HttpStatus.CREATED).json({
        message,
        error: false,
        success: true,
        data: result.item,
        action: result.action,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Đã xảy ra lỗi khi thêm vào giỏ hàng',
        error: true,
        success: false,
      });
    }
  }

  @Get()
  async getCart(@Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Vui lòng đăng nhập để xem giỏ hàng',
          error: true,
          success: false,
        });
      }

      const cart = await this.cartService.getActiveCart(user.id);
      const { totalQuantity, distinctItems } =
        await this.cartService.getCartItemCounts(user.id);
      return res.status(HttpStatus.OK).json({
        message: 'Lấy thông tin giỏ hàng thành công',
        error: false,
        success: true,
        data: cart,
        totalQuantity: totalQuantity,
        count: distinctItems,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Đã xảy ra lỗi khi lấy thông tin giỏ hàng',
        error: true,
        success: false,
      });
    }
  }
  @Get('shop')
  async getCartShop(@Req() req, @Res() res) {
    const user = req.user;
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Vui lòng đăng nhập để thực hiện',
        error: true,
        success: false,
      });
    }
    try {
      const data = await this.cartService.getCartGroupedByShop(user.id);
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Lấy danh sách thành công',
        error: false,
        success: true,
        data: data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }
  @Patch('items/:itemId')
  async updateCartItem(
    @Param('itemId') itemId: string,
    @Body() updateCartDto: UpdateCartDto,
    @Res() res,
    @Req() req,
  ) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Vui lòng đăng nhập để cập nhật giỏ hàng',
          error: true,
          success: false,
        });
      }

      const updatedItem = await this.cartService.updateCartItem(
        user.id,
        parseInt(itemId),
        updateCartDto,
      );
      return res.status(HttpStatus.OK).json({
        message: 'Cập nhật giỏ hàng thành công',
        error: false,
        success: true,
        data: updatedItem,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Đã xảy ra lỗi khi cập nhật giỏ hàng',
        error: true,
        success: false,
      });
    }
  }

  @Delete('items/:itemId')
  async removeCartItem(
    @Param('itemId') itemId: string,
    @Res() res,
    @Req() req,
  ) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng',
          error: true,
          success: false,
        });
      }

      await this.cartService.removeCartItem(user.id, parseInt(itemId));
      return res.status(HttpStatus.OK).json({
        message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
        error: false,
        success: true,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:
          error.message || 'Đã xảy ra lỗi khi xóa sản phẩm khỏi giỏ hàng',
        error: true,
        success: false,
      });
    }
  }
}

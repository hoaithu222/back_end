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
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { error } from 'console';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(@Body() body: CreateReviewDto, @Res() res, @Req() req) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Bạn vui lòng đăng nhập để tiếp tục',
          error: true,
          success: false,
        });
      }
      const review = await this.reviewService.create(+user.id, body);
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Đã tạo danh giá thành công',
        error: false,
        success: true,
        data: review,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req,
    @Res() res,
  ) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn vui lòng đăng nhập để tiếp tục',
          error: true,
          success: false,
        });
      }

      const review = await this.reviewService.update(
        +id,
        +user.id,
        updateReviewDto,
      );
      return res.status(HttpStatus.OK).json({
        message: 'Cập nhật đánh giá thành công',
        data: review,
        error: false,
        success: true,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req, @Res() res) {
    try {
      const user = req.user;
      if (!user && user.role === 'Admin') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Bạn không có quyền xóa',
          error: true,
          success: false,
        });
      }

      await this.reviewService.remove(+id);
      return res.status(HttpStatus.OK).json({
        message: 'Xóa đánh giá thành công',
        error: false,
        success: true,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }

  @Get('shop/:shopId')
  async getShopReviews(
    @Param('shopId') shopId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Res() res,
  ) {
    try {
      const reviews = await this.reviewService.findAllByShop(
        +shopId,
        page ? +page : 1,
        limit ? +limit : 10,
      );
      return res.status(HttpStatus.OK).json({
        message: 'Lấy danh sách đánh giá thành công',
        data: reviews,
        error: false,
        success: true,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }
  @Get('order/:orderId')
  async getReviewWithOrder(@Param('orderId') orderId: string, @Res() res) {
    try {
      const review = await this.reviewService.getReviewWithOrder(+orderId);
      if (!review) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Đã có lỗi xảy ra khi lấy dữ liệu với database',
          error: true,
          success: false,
        });
      }
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Đã lấy review thành công',
        error: false,
        success: true,
        data: review,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }
  @Get('user/:userId')
  async getUserReviews(
    @Param('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Res() res,
  ) {
    try {
      const reviews = await this.reviewService.findAllByUser(
        +userId,
        page ? +page : 1,
        limit ? +limit : 10,
      );
      return res.status(HttpStatus.OK).json({
        message: 'Lấy danh sách đánh giá thành công',
        data: reviews,
        error: false,
        success: true,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }
}

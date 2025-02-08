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
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

import { z } from 'zod';
import { error } from 'console';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  async create(@Body() body: CreateShopDto, @Res() res) {
    // const user = req.user;
    // if (!user && !user.id) {
    //   return res.status(HttpStatus.UNAUTHORIZED).json({
    //     message: 'Vui lòng đăng nhập lại',
    //     error: true,
    //     success: false,
    //   });
    // }
    const userExit = await this.shopService.findShopByUserId(body.user_id);
    if (userExit) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Người dùng đã đăng ký shop. Vui lòng chờ admin xét duyệt.',
        error: true,
        success: false,
      });
    }
    try {
      const schema = z.object({
        name: z
          .string({
            required_error: 'Tên bắt buộc phải nhập',
          })
          .min(3, 'Tên phải trên 3 kí tự')
          .refine(async (username) => {
            const shop = await this.shopService.findOneByUsername(username);
            return !shop;
          }, 'Tên shop đã có người sử dụng'),
        description: z.string({ required_error: 'Mô tả không được để trống' }),
      });
      const validateFields = await schema.safeParseAsync(body);
      if (!validateFields.success) {
        const errors = validateFields.error.flatten().fieldErrors;
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: true,
          errors,
        });
      }
      const create = await this.shopService.create(body);

      return res.status(HttpStatus.CREATED).json({
        message: 'Đã tạo shop thành công',
        error: false,
        success: true,
        data: create,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_GATEWAY).json({
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
  }

  @Get()
  async findAll(@Query() query, @Res() res, @Req() req) {
    const user = req.user;

    if (!((user.role === 'Admin' && user.is_admin) || user.role === 'Shop')) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền',
        error: true,
        success: false,
      });
    }
    const {
      _page = 1,
      _limit = 8,
      _order = 'asc',
      _sort = 'id',
      filter_name,
      q,
    } = query;
    const filter = {} as { [key: string]: string | boolean | {} };
    if (filter_name) {
      filter.name = filter_name;
    }
    if (q) {
      filter.OR = [
        {
          name: {
            contains: q,
            mode: 'insensitive',
          },
        },
      ];
    }
    const { count, rows } = await this.shopService.findAll({
      page: +_page,
      limit: +_limit,
      sort: _sort,
      order: _order,
      filter,
    });
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Lấy danh sách thành công',
      data: rows,
      currentPage: +_page,
      count: count,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res, @Req() req) {
    // const user = req.user;

    // if (!(user.role === 'Admin' && user.is_admin)) {
    //   return res.status(HttpStatus.UNAUTHORIZED).json({
    //     message: 'Bạn không có quyền ',
    //     error: true,
    //     success: false,
    //   });
    // }
    const shop = await this.shopService.findOne(+id);
    if (!shop) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Đã xảy ra lỗi vui lòng thử lại sau',
        success: false,
        error: true,
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Lấy thông tin chi tiết shop thành công',
      error: false,
      success: true,
      data: shop,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateShopDto,
    @Res() res,
    @Req() req,
  ) {
    const user = req.user;
    console.log(user.role);
    if (!user || user.role !== 'Shop') {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền',
        error: true,
        success: false,
      });
    }

    const updateShop = await this.shopService.update(+id, body);
    if (!updateShop) {
      return res.status(HttpStatus.BAD_GATEWAY).json({
        message: 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Cập nhật thông tin thành công',
      error: false,
      success: true,
      data: updateShop,
    });
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.shopService.remove(+id);
  // }
  @Post('userId')
  async findShopById(@Body() body, @Res() res) {
    const shopUserId = await this.shopService.findShopByUserId(body.id);
    if (!shopUserId) {
      return res.status(HttpStatus.OK).json({
        success: true,
        error: false,
        message: 'Chưa tồn tại shop',
      });
    }
    return res.status(HttpStatus.OK).json({
      error: true,
      success: false,
      message: 'Bạn đã đăng kí bán hàng.Vui lòng chờ admin xét duyệt',
    });
  }
  @Patch(':id/active')
  async updateShopActive(
    @Param('id') id: string,
    @Body() body: UpdateShopDto,
    @Res() res,
    @Req() req,
  ) {
    const user = req.user;
    if (!(user.role === 'Admin' && user.is_admin)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn không có quyền',
        error: true,
        success: false,
      });
    }
    const updateShop = await this.shopService.updateActive(+id, body);
    if (!updateShop) {
      return res.status(HttpStatus.BAD_GATEWAY).json({
        message: 'Đã xảy ra lỗi vui lòng thử lại sau',
        error: true,
        success: false,
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Cập nhật thông tin thành công',
      error: false,
      success: true,
      data: updateShop,
    });
  }
}

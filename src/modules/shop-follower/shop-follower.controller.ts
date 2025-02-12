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
import { ShopFollowerService } from './shop-follower.service';
import { CreateShopFollowerDto } from './dto/create-shop-follower.dto';
import { UpdateShopFollowerDto } from './dto/update-shop-follower.dto';

@Controller('shop-follower')
export class ShopFollowerController {
  constructor(private readonly shopFollowerService: ShopFollowerService) {}

  @Post()
  async create(@Body() body: CreateShopFollowerDto, @Res() res, @Req() req) {
    const user = req.user;
    if (!user) {
      return res.status(HttpStatus.BAD_GATEWAY).json({
        message: 'Bạn hãy đăng nhập để theo dõi',
        error: true,
        success: false,
      });
    }
    try {
      const data = await this.shopFollowerService.create({
        userId: user.id,
        body,
      });
      if (!data) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Bạn đã theo dõi shop trước đó',
          error: true,
          success: false,
        });
      }
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Theo dõi shop thành công',
        data: data,
        error: false,
        success: true,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi',
        error: true,
        success: false,
      });
    }
  }
  @Post('unfollow')
  async unfollowShop(
    @Body() body: CreateShopFollowerDto,
    @Res() res,
    @Req() req,
  ) {
    const user = req.user;
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Bạn hãy đăng nhập để thực hiện',
        error: true,
        success: false,
      });
    }

    try {
      const data = await this.shopFollowerService.unfollowShop({
        userId: user.id,
        body,
      });
      return res.status(HttpStatus.OK).json({
        message: 'Hủy theo dõi shop thành công',
        error: false,
        success: true,
        data: data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Đã xảy ra lỗi',
        error: true,
        success: false,
      });
    }
  }

  @Get()
  findAll() {
    return this.shopFollowerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shopFollowerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShopFollowerDto: UpdateShopFollowerDto,
  ) {
    return this.shopFollowerService.update(+id, updateShopFollowerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopFollowerService.remove(+id);
  }
}

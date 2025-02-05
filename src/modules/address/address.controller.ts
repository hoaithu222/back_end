import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { z } from 'zod';
import { error } from 'console';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}
  @Post('create')
  async createAddress(@Body() body: CreateAddressDto, @Req() req, @Res() res) {
    const phoneRegex = /^[0-9]{10,11}$/; // Số điện thoại hợp lệ

    // Schema để validate dữ liệu đầu vào
    const schema = z.object({
      recipient_name: z.string({
        required_error: 'Tên người nhận hàng bắt buộc phải nhập',
      }),
      phone: z
        .string({
          required_error: 'Số điện thoại bắt buộc phải nhập',
        })
        .regex(phoneRegex, {
          message: 'Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số.',
        }),
      address_line1: z.string({
        required_error: 'Địa chỉ cụ thể không thể để trống',
      }),
      city: z.string({
        required_error: 'Thành phố không được để trống',
      }),
      district: z.string({
        required_error: 'Huyện không được để trống',
      }),
      ward: z.string({
        required_error: 'Xã không được để trống',
      }),
      is_default: z.boolean().optional(),
    });

    // Validate dữ liệu
    const validateFields = await schema.safeParseAsync(body);

    if (!validateFields.success) {
      const errors = validateFields.error.flatten().fieldErrors;
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: true,
        message: 'Dữ liệu không hợp lệ hoặc thiếu thông tin',
        errors,
      });
    }

    // Kiểm tra người dùng từ request
    const user = req.user;
    if (!user || !user.id) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Người dùng chưa được xác thực',
        success: false,
        error: true,
      });
    }

    try {
      // Gọi service để tạo địa chỉ
      const newAddress = await this.addressService.createAddress(user.id, body);

      return res.status(HttpStatus.CREATED).json({
        message: 'Tạo địa chỉ thành công',
        data: newAddress,
        success: true,
        error: false,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Đã xảy ra lỗi khi tạo địa chỉ',
        error: true,
        success: false,
      });
    }
  }
  @Get()
  async findAll(@Req() req, @Res() res) {
    const user = req.user;
    if (!user?.id) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: true,
        message: 'User not authenticated',
      });
    }
    const data = await this.addressService.findAll(user.id);
    if (!data) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: true,
        message: 'Lỗi khi lấy danh sách địa chỉ',
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Lấy danh sách địa chỉ thành công',
      success: true,
      error: false,
      data: data,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateAddressDto,
    @Res() res,
    @Req() req,
  ) {
    const user = req?.user;
    if (!user?.id) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: true,
        message: 'Không tìm thấy người dùng vui lòng đăng nhập lại',
      });
    }

    try {
      const update = await this.addressService.update(+id, body, +user.id);
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Cập nhật địa chỉ thành công',
        error: false,
        success: true,
        data: update,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Đã xảy ra lỗi khi sửa địa chỉ',
        error: true,
        errors: error,
        success: false,
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res) {
    const data = await this.addressService.remove(+id);
    if (!data) {
      return res.status(HttpStatus.BAD_GATEWAY).json({
        message: 'Lỗi khi xóa địa chỉ',
        error: true,
        success: false,
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({
      message: 'Bạn đã xóa thành công',
      error: false,
      success: true,
    });
  }
}

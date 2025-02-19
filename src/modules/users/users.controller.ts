import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { z } from 'zod';
import { SendEmailService } from '../send-email/send-email.service';
import verifyEmailTemplate from 'src/utils/verifyEmailTemplate';
import { error } from 'console';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly sendEmail: SendEmailService,
  ) {}

  @Post('register')
  async create(@Body() body: CreateUserDto, @Res() res) {
    try {
      const schema = z.object({
        username: z
          .string()
          .min(3, 'Tên phải trên 3 kí tự')
          .refine(async (username) => {
            const user = await this.usersService.findOneByUsername(username);
            return !user;
          }, 'Tên đã có người sử dụng'),

        fullname: z.string(),

        email: z
          .string()
          .email('Email không đúng định dạng')

          .refine(async (email) => {
            const user = await this.usersService.findOneByEmail(email);
            return !user;
          }, 'Email đã có người sử dụng'),

        password: z.string().min(6, 'Mật khẩu phải trên 6 kí tự'),
      });
      const validateFields = await schema.safeParseAsync(body);
      if (!validateFields.success) {
        const errors = validateFields.error.flatten().fieldErrors;
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: true,
          errors,
          message: 'Validation error',
        });
      }

      const data = await this.usersService.create({
        username: body.username,
        full_name: body.fullname,
        email: body.email,
        password: body.password,
      });

      const verificationToken = await this.usersService.generateVerifyEmail(
        data.id,
      );

      const verifyEmailUrl = `${process.env.USER_FRONTEND_URL}/verify-email?token=${verificationToken}`;

      await this.sendEmail.sendEmail({
        sendTo: data.email,
        subject: 'Xác thực email',
        html: verifyEmailTemplate({
          name: data.full_name,
          url: verifyEmailUrl,
          expiryHours: 1,
        }),
      });

      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: {
          id: data.id,
          email: data.email,
        },
        message:
          'Tạo người dùng thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,

        message: 'Có lỗi xảy ra khi đăng ký',
      });
    }
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res) {
    try {
      const result = await this.usersService.verifyEmail(token);

      if (!result.success) {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }

      return res.status(HttpStatus.OK).json({
        message: 'Verify tài khoản thành công',
        success: true,
        error: false,
      });
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: true,
        message: 'Có lỗi xảy ra khi xác thực email',
      });
    }
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { userId: number }, @Res() res) {
    try {
      const result = await this.usersService.resendVerificationEmail(
        body.userId,
      );

      if (!result.success) {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }

      const user = await this.usersService.findOne(body.userId);
      const verifyEmailUrl = `${process.env.USER_FRONTEND_URL}/verify-email?token=${result.token}`;

      await this.sendEmail.sendEmail({
        sendTo: user.email,
        subject: 'Xác thực email',
        html: verifyEmailTemplate({
          name: user.full_name,
          url: verifyEmailUrl,
          expiryHours: 1,
        }),
      });

      return res.status(HttpStatus.OK).json({
        success: true,
        error: false,
        message: 'Email xác thực đã được gửi lại',
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: true,
        message: 'Có lỗi xảy ra khi gửi lại email xác thực',
      });
    }
  }

  @Get()
  async findAll(@Query() query, @Res() res, @Req() req) {
    const user = req.user;
    if (!user && user.role !== 'Admin') {
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
      username,
      q,
    } = query;
    const filter = {} as { [key: string]: string | boolean | {} };
    if (username) {
      filter.username = username;
    }
    if (q) {
      filter.OR = [
        {
          username: {
            contains: q,
            mode: 'insensitive',
          },
        },
      ];
    }
    try {
      const { rows, count } = await this.usersService.findAll({
        page: +_page,
        limit: +_limit,
        sort: _sort,
        order: _order,
        filter,
      });
      return res.status(HttpStatus.ACCEPTED).json({
        message: 'Đã lấy danh sách thành công',
        error: false,
        success: true,
        count: count,
        data: rows,
        current_page: _page,
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: error.message || 'Đã xảy ra lỗi',
        error: true,
        success: false,
      });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateProfile(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

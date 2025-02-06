import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

import Hash from 'src/utils/hashing';
import JWT from 'src/utils/jwt';
import { response, Response } from 'express';
import generatedOtp from 'src/utils/generatedOtp';
import { SendEmailService } from '../send-email/send-email.service';

import resetPasswordWithOtpTemplate from 'src/utils/resetPasswordTemplate';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sendEmail: SendEmailService,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: LoginDto, @Res() res) {
    try {
      if (!email || !password) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Email và mật khẩu là bắt buộc',
          success: false,
          error: true,
        });
      }

      const user = await this.authService.getUserByField('email', email);
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Email hoặc mật khẩu không chính xác',
          error: true,
          success: false,
        });
      }

      if (!user.verifyEmail) {
        return res.status(HttpStatus.FORBIDDEN).json({
          message:
            'Email chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.',
          success: false,
          error: true,
          errorCode: 'EMAIL_NOT_VERIFIED',
        });
      }

      const isPasswordValid = Hash.verify(password, user.password);
      if (!isPasswordValid) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Email hoặc mật khẩu không chính xác',
          success: false,
          error: true,
        });
      }

      const accessToken = JWT.createAccessToken({
        userId: user.id,
        email: user.email,
      });
      const refreshToken = JWT.createRefreshToken();
      const id = user.id;

      await this.authService.updateUserRefreshToken(+id, refreshToken);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Có lỗi xảy ra trong quá trình đăng nhập',
        success: false,
        error: true,
      });
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: LoginDto, @Res() res) {
    try {
      if (!email) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Email là bắt buộc',
          success: false,
          error: true,
        });
      }

      const user = await this.authService.getUserByField('email', email);
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: `Email không chính xác, không tìm thấy email ${email} . Vui lòng tạo tài khoản`,
          error: true,
          success: false,
        });
      }
      const codeOtp = await this.authService.generateOtp(user.id);
      const resetPassword = `${process.env.USER_FRONTEND_URL}/verification-otp`;

      await this.sendEmail.sendEmail({
        sendTo: user.email,
        subject: 'Quên mật khẩu',
        html: resetPasswordWithOtpTemplate({
          userName: user.full_name,
          resetLink: resetPassword,
          otpCode: codeOtp,
        }),
      });
      return res.status(HttpStatus.OK).json({
        message: 'Vui lòng kiểm tra mail để xem mã lấy mã otp',
        success: true,
        error: false,
      });
    } catch (error) {
      console.error('Lỗi quên mật khẩu:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Có lỗi xảy ra trong quá trình xác minh mã otp',
        success: false,
        error: true,
      });
    }
  }
  // verify forgot password
  @Post('verify-otp')
  async verifyForgotPasswordOtp(
    @Body() { forgotPasswordOtp, email }: LoginDto,
    @Res() res,
  ) {
    // Tìm người dùng theo email
    try {
      const verifyOtp = await this.authService.verifyOtp(
        forgotPasswordOtp,
        email,
      );
      if (!verifyOtp) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: true,
          message: 'Đã xảy ra lỗi vui lòng thử lại sau',
          success: false,
        });
      }
      return res.status(HttpStatus.OK).json({
        error: false,
        success: true,
        message: 'Vui lòng reset mật khẩu',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: true,
        message: error.message || 'Đã xảy ra lỗi vui lòng thử lại sau',
        success: false,
      });
    }
  }
  // reset password
  @Post('reset-password')
  async resetPassword(@Body() { email, password }: LoginDto, @Res() res) {
    if (!password) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: 'Vui lòng nhập đầy đủ thông tin',
        success: false,
        error: true,
      });
    }
    try {
      const user = await this.authService.getUserByField('email', email);

      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Email không tồn tại vui long tạo tài khoản',
          error: true,
          success: false,
        });
      }
      const resetPasswordUser = await this.authService.resetPasswordUser(
        email,
        password,
      );
      if (!resetPasswordUser) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Đã xảy ra lỗi',
          error: true,
          success: false,
        });
      }
      return res.status(HttpStatus.OK).json({
        message:
          'Đã thay đổi mật khẩu thành công vui lòng đăng nhập bằng mặt khẩu mới',
        error: false,
        success: true,
      });
    } catch (error) {
      console.error('Lỗi reset mật khẩu:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Có lỗi xảy ra trong quá trình reset mật khẩu',
        success: false,
        error: true,
      });
    }
  }
  @Post('refresh-token')
  async refreshToken(
    @Body() { refreshToken }: { refreshToken: string },
    @Res() res,
  ) {
    if (!refreshToken) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'RefreshToken không được để trống',
        success: false,
        error: true,
      });
    }

    try {
      // Find user with this refresh token
      const user = await this.authService.getUserByRefreshToken(refreshToken);

      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: true,
          message: 'Refresh Token không hợp lệ hoặc đã hết hạn',
        });
      }

      // Clear old refresh token
      await this.authService.updateUserRefreshToken(user.id, null);

      // Create new tokens
      const newAccessToken = JWT.createAccessToken({
        userId: user.id,
        email: user.email,
      });
      const newRefreshToken = JWT.createRefreshToken();

      // Save new refresh token
      await this.authService.updateUserRefreshToken(user.id, newRefreshToken);

      return res.json({
        success: true,
        message: 'Refresh Token thành công',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: true,
        message: 'Có lỗi xảy ra khi refresh token',
      });
    }
  }

  @Get('profile')
  async profile(@Req() req: any, @Res() res: Response) {
    const user = req.user;
    if (!user && !user.id) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Vui lòng đăng nhập lại',
        error: true,
        success: false,
      });
    }
    console.log(user.id);
    return res.json({
      success: true,
      message: 'Get profile successfully',
      data: user,
    });
  }
  @Post('logout')
  async logout(@Req() req: any, @Res() res: Response) {
    const user = req.user;

    if (!user) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: true,
        message: 'User không được tìm thấy',
      });
    }

    // Clear refresh token in database
    await this.authService.updateUserRefreshToken(user.id, null);

    return res.json({
      success: true,
      message: 'Logout success',
    });
  }
}

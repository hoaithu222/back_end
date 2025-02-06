import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';

import JWT from 'src/utils/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Controller('auth/social')
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly authService: AuthService,
  ) {}
  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Điểm khởi đầu đăng nhập Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    try {
      const { user: googleUser } = req;

      // Tìm hoặc tạo user từ thông tin Google
      const user = await this.socialService.findOrCreateGoogleUser(googleUser);

      // Tạo tokens
      const accessToken = JWT.createAccessToken({
        userId: user.id,
        email: user.email,
      });
      const refreshToken = JWT.createRefreshToken();

      // Lưu refresh token vào Redis
      // const redisStore = await redis;
      // await redisStore.set(
      //   `refreshToken_${user.id}`,
      //   JSON.stringify({ refreshToken, userId: user.id, email: user.email }),
      // );
      await this.authService.updateUserRefreshToken(user.id, refreshToken);
      // Redirect về frontend với tokens
      const frontendURL = process.env.USER_FRONTEND_URL;
      return res.redirect(
        `${frontendURL}/auth/callback/google?` +
          `accessToken=${accessToken}&` +
          `refreshToken=${refreshToken}`,
      );
    } catch (error) {
      const frontendURL = process.env.USER_FRONTEND_URL;
      return res.redirect(`${frontendURL}/auth/callback/google?error=true`);
      console.log(error);
    }
  }

  // Facebook OAuth
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Điểm khởi đầu đăng nhập Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req, @Res() res) {
    try {
      const { user: facebookUser } = req;

      // Tìm hoặc tạo user từ thông tin Facebook
      const user =
        await this.socialService.findOrCreateFacebookUser(facebookUser);

      // Tạo tokens
      const accessToken = JWT.createAccessToken({
        userId: user.id,
        email: user.email,
      });
      const refreshToken = JWT.createRefreshToken();

      // Lưu refresh token vào Redis
      // const redisStore = await redis;
      // await redisStore.set(
      //   `refreshToken_${user.id}`,
      //   JSON.stringify({ refreshToken, userId: user.id, email: user.email }),
      // );
      await this.authService.updateUserRefreshToken(user.id, refreshToken);
      // Redirect về frontend với tokens
      const frontendURL = process.env.USER_FRONTEND_URL;
      return res.redirect(
        `${frontendURL}/auth/callback/facebook?` +
          `accessToken=${accessToken}&` +
          `refreshToken=${refreshToken}`,
      );
    } catch (error) {
      const frontendURL = process.env.USER_FRONTEND_URL;
      return res.redirect(`${frontendURL}/auth/callback/facebook?error=true`);
      console.log(error);
    }
  }
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Điểm khởi đầu đăng nhập GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req, @Res() res) {
    try {
      const { user: githubUser } = req;

      // Tìm hoặc tạo user từ thông tin GitHub
      const user = await this.socialService.findOrCreateGithubUser(githubUser);

      // Tạo tokens
      const accessToken = JWT.createAccessToken({
        userId: user.id,
        email: user.email,
      });
      const refreshToken = JWT.createRefreshToken();

      // Lưu refresh token vào Redis
      // const redisStore = await redis;
      // await redisStore.set(
      //   `refreshToken_${user.id}`,
      //   JSON.stringify({ refreshToken, userId: user.id, email: user.email }),
      // );
      await this.authService.updateUserRefreshToken(user.id, refreshToken);

      // Redirect về frontend với tokens
      const frontendURL = process.env.USER_FRONTEND_URL;
      return res.redirect(
        `${frontendURL}/auth/callback/github?` +
          `accessToken=${accessToken}&` +
          `refreshToken=${refreshToken}`,
      );
    } catch (error) {
      const frontendURL = process.env.USER_FRONTEND_URL;
      return res.redirect(`${frontendURL}/auth/callback/github?error=true`);
      console.log(error);
    }
  }
}

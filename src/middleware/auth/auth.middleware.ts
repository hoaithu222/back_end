import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import JWT from 'src/utils/jwt';
import { redis } from 'src/utils/redis';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: any, res: any, next: () => void) {
    try {
      // Lấy token từ headers hoặc cookies
      const token =
        req.headers.authorization?.split(' ').slice(-1).join() ||
        req.cookies['accessToken'];

      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: true,
          message: 'Unauthorized - Token is required',
        });
      }

      // Xác thực token
      const decoded = JWT.verifyAccessToken(token);
      if (!decoded || decoded instanceof Error) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: true,
          message: 'Unauthorized - Invalid Token',
        });
      }
      // Kiểm tra token có nằm trong blacklist
      const redisStore = await redis;
      const isBlackList = await redisStore.get(`blacklist_${token}`);
      if (isBlackList) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: true,
          message: 'Unauthorized - Token blacklisted',
        });
      }

      // Lấy thông tin người dùng
      const user = await this.authService.getUserByField('id', decoded.userId);
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: true,
          message: 'Unauthorized - User not found',
        });
      }

      // Gắn thông tin user vào request
      req.user = user;
      req.token = token;
      console.log('token - role', token, user.role);

      next();
    } catch (error) {
      // Xử lý lỗi
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error - Middleware failed',
        error: true,
        errors: error,
      });
    }
  }
}

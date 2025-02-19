import { Injectable } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import Hash from 'src/utils/hashing';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  create(body: any) {
    // logic thêm dữ liệu vào database
    body.created_at = new Date();
    body.updated_at = new Date();
    body.password = Hash.make(body.password);
    return this.prisma.user.create({
      data: {
        ...body,
      },
    });
  }

  async findAll({ page, limit, sort, order, filter = {} }) {
    const skip = (page - 1) * limit;
    const count = await this.prisma.user.count();
    const rows = await this.prisma.user.findMany({
      skip: skip,
      take: limit,
      where: filter,
      orderBy: {
        [sort]: order,
      },
    });
    return { rows, count };
  }

  findOne(id: number) {
    return this.prisma.user.findFirst({
      where: {
        id: id,
      },
    });
  }

  updateProfile(id: number, body: any) {
    body.updated_at = new Date();
    return this.prisma.user.update({
      data: body,
      where: {
        id: id,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  findOneByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
  }
  findOneByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: {
        username: username,
      },
    });
  }
  async generateVerifyEmail(userId: number) {
    const token = uuidv4();
    const expiryDate = new Date();

    expiryDate.setHours(expiryDate.getHours() + 1);
    await this.prisma.user.update({
      data: {
        verificationToken: token,
        verificationTokenExpiry: expiryDate,
      },
      where: {
        id: userId,
      },
    });
    return token;
  }
  async verifyEmail(token: string) {
    try {
      // Tìm user với token
      const user = await this.prisma.user.findFirst({
        where: {
          verificationToken: token,
        },
      });

      // Kiểm tra token có tồn tại
      if (!user) {
        return {
          success: false,
          message: 'Link xác thực không hợp lệ',
        };
      }

      // Kiểm tra đã verify chưa
      if (user.verifyEmail) {
        return {
          success: false,
          message: 'Email đã được xác thực trước đó',
        };
      }

      // Kiểm tra token hết hạn
      if (user.verificationTokenExpiry < new Date()) {
        return {
          success: false,
          message: 'Link xác thực đã hết hạn',
          isExpired: true,
        };
      }

      // Cập nhật trạng thái verify
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          verifyEmail: true,
          verifiedAt: new Date(),
          verificationToken: null,
          verificationTokenExpiry: null,
        },
      });

      return {
        success: true,
        message: 'Xác thực email thành công',
      };
    } catch (error) {
      console.error('Verify email error:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi xác thực email',
        error: error.message,
      };
    }
  }

  // Gửi lại email xác thực
  async resendVerificationEmail(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'Không tìm thấy người dùng',
        };
      }

      if (user.verifyEmail) {
        return {
          success: false,
          message: 'Email đã được xác thực',
        };
      }

      const token = await this.generateVerifyEmail(userId);

      return {
        success: true,
        token,
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: 'Không thể gửi lại email xác thực',
      };
    }
  }
}

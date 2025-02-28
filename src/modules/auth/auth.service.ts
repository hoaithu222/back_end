import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import generatedOtp from 'src/utils/generatedOtp';
import Hash from 'src/utils/hashing';

// Interface for Google OAuth user data

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  getUserByField(field: string = 'id', value: string) {
    return this.prisma.user.findFirst({
      where: {
        [field]: value,
      },
      include: {
        Shop: true,
        ShopFollower: true,
        user_addresses: true,
        user_notifications: true,
        Order: true,
        Review: true,
      },
    });
  }
  async generateOtp(userId) {
    const otp = generatedOtp().toString();
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 10); // 10 phút
    const updateUserOtp = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        forgotPasswordOtp: otp,
        forgotPasswordExpiry: expireTime,
      },
    });
    return otp;
  }

  async verifyOtp(forgotPasswordOtp, email) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new Error('Không tìm thấy user');
    }
    if (user.forgotPasswordExpiry < new Date()) {
      throw new Error('Mã otp đã hết hạn');
    }
    if (forgotPasswordOtp !== user.forgotPasswordOtp.toString()) {
      throw new Error('Mã otp không khớp');
    }
    const updateUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        forgotPasswordOtp: null,
        forgotPasswordExpiry: null,
      },
    });
    return updateUser;
  }
  async resetPasswordUser(email, password) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new Error('Không tìm thấy user');
    }
    const passwordHash = Hash.make(password);
    const userUpdatePassword = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: passwordHash,
      },
    });
    return userUpdatePassword;
  }
  async updateUserRefreshToken(userId: number, refreshToken: string | null) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: refreshToken,
        // Add token expiry time (e.g., 7 days from now)
        refreshTokenExpiry: refreshToken
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : null,
      },
    });
  }

  async getUserByRefreshToken(refreshToken: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        refreshToken: refreshToken,
        refreshTokenExpiry: {
          gt: new Date(), // Only valid if expiry is greater than current time
        },
      },
    });
    return user;
  }

  async isTokenBlacklisted(token: string) {
    const blacklistedToken = await this.prisma.blacklistedToken.findFirst({
      where: {
        token: token,
        expiresAt: {
          gt: new Date(), // Only check non-expired entries
        },
      },
    });

    if (blacklistedToken) {
      return true;
    }

    return false;
  }

  async blacklistToken(token: string) {
    return this.prisma.blacklistedToken.create({
      data: {
        token: token,
        // Blacklist tokens for 24 hours
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }
}

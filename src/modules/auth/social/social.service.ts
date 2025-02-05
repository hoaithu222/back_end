import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

interface FacebookUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}
@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateGoogleUser(googleUser: GoogleUser) {
    // Tìm user theo email
    let user = await this.prisma.user.findFirst({
      where: {
        email: googleUser.email,
      },
    });

    // Nếu chưa có user thì tạo mới
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          username: googleUser.firstName,
          full_name: googleUser.lastName + googleUser.firstName,
          avatar_url: googleUser.picture,
          googleId: googleUser.accessToken,
          verifyEmail: true,
          password: '',
        },
      });
    }

    return user;
  }

  async findOrCreateFacebookUser(facebookUser: FacebookUser) {
    // Tìm user theo email
    let user = await this.prisma.user.findFirst({
      where: {
        email: facebookUser.email,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: facebookUser.email,
          username: facebookUser.firstName,
          full_name: facebookUser.lastName + facebookUser.firstName,
          avatar_url: facebookUser.picture,
          facebookId: facebookUser.accessToken,
          verifyEmail: true,
          password: '',
        },
      });
    }

    return user;
  }
  async findOrCreateGithubUser(githubUser: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
  }) {
    let user = await this.prisma.user.findFirst({
      where: {
        email: githubUser.email,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: githubUser.email,
          username: githubUser.firstName,
          full_name: githubUser.lastName + githubUser.firstName,
          verifyEmail: true,
          avatar_url: githubUser.picture,
          githubId: githubUser.accessToken,
          password: '',
        },
      });
    }

    return user;
  }
}

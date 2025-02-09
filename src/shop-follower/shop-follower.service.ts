import { Injectable } from '@nestjs/common';
import { CreateShopFollowerDto } from './dto/create-shop-follower.dto';
import { UpdateShopFollowerDto } from './dto/update-shop-follower.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ShopFollowerService {
  constructor(private readonly prisma: PrismaService) {}
  async create({
    body,
    userId,
  }: {
    body: CreateShopFollowerDto;
    userId: number;
  }) {
    // kiểm tra user đó có phải tạo shop hay không
    const isUserShop = await this.prisma.shop.findFirst({
      where: {
        user_id: userId,
        id: body.shop_id,
      },
    });
    if (isUserShop) {
      throw new Error('Bạn không thể theo dõi shop của chính mình');
    }
    // kiểm tra user đã follow shop chưa
    const isFollow = await this.prisma.shopFollower.findFirst({
      where: {
        shop_id: body.shop_id,
        user_id: userId,
      },
    });
    if (isFollow) {
      throw new Error('Bạn đã theo dõi shop trước đó');
    }
    // Tiến hành thêm mới và cập nhật số lượng follower
    const data = await this.prisma.$transaction(async (tx) => {
      const newFollow = await tx.shopFollower.create({
        data: {
          shop_id: body.shop_id,
          user_id: userId,
          followed_at: new Date(),
        },
      });

      await tx.shop.update({
        where: {
          id: body.shop_id,
        },
        data: {
          followers: {
            increment: 1,
          },
        },
      });

      return newFollow;
    });
    return data;
  }
  async unfollowShop({
    body,
    userId,
  }: {
    body: CreateShopFollowerDto;
    userId: number;
  }) {
    const isFollow = await this.prisma.shopFollower.findFirst({
      where: {
        shop_id: body.shop_id,
        user_id: userId,
      },
    });

    if (!isFollow) {
      throw new Error('Bạn chưa theo dõi shop này');
    }

    const data = await this.prisma.shopFollower.delete({
      where: {
        shop_id_user_id: { shop_id: body.shop_id, user_id: userId },
      },
    });
    await this.prisma.shop.update({
      where: {
        id: body.shop_id,
      },
      data: {
        followers: {
          decrement: 1,
        },
      },
    });
    return data;
  }

  findAll() {
    return `This action returns all shopFollower`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shopFollower`;
  }

  update(id: number, updateShopFollowerDto: UpdateShopFollowerDto) {
    return `This action updates a #${id} shopFollower`;
  }

  remove(id: number) {
    return `This action removes a #${id} shopFollower`;
  }
}

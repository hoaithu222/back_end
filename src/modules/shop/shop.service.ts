import { Injectable } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}
  async create(body: CreateShopDto) {
    try {
      const userExit = await this.prisma.user.findFirst({
        where: {
          id: body.user_id,
        },
      });
      if (!userExit) {
        throw new Error(` Người dùng ${body.user_id} không tồn tại `);
      }
      const createShop = await this.prisma.shop.create({
        data: {
          name: body.name,
          description: body.description,
          logo_url: body.logo_url,
          banner_url: body.banner_url,
          rating: 0,
          user_id: body.user_id,
        },
      });
      return createShop;
    } catch (error) {
      throw new Error('Lỗi khi thao tác với database' + error.message);
    }
  }

  async findAll({ page, limit, sort, order, filter = {} }) {
    const skip = (page - 1) * limit;
    const count = await this.prisma.shop.count({ where: filter });
    const rows = await this.prisma.shop.findMany({
      skip: skip,
      take: limit,
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        products: true,
      },
      orderBy: {
        [sort]: order,
      },
    });
    return { count, rows };
  }

  async findOne(id: number) {
    const shopById = await this.prisma.shop.findFirst({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        products: {
          include: {
            product_images: true,
          },
        },
        shop_followers: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!shopById) {
      return null;
    }
    return shopById;
  }

  async update(id: number, body: UpdateShopDto) {
    const shop = await this.prisma.shop.update({
      where: {
        id: id,
      },
      data: {
        ...body,
      },
    });
    if (!shop) {
      return null;
    }
    return shop;
  }

  remove(id: number) {
    return `This action removes a #${id} shop`;
  }
  async findOneByUsername(name: string) {
    if (!name) {
      return null;
    }
    const nameExit = await this.prisma.shop.findFirst({
      where: {
        name: name,
      },
    });

    return nameExit;
  }
  async findShopByUserId(id: number) {
    return this.prisma.shop.findFirst({
      where: {
        user_id: id,
      },
    });
  }

  async updateActive(id: number, body: UpdateShopDto) {
    const shop = await this.prisma.shop.update({
      where: {
        id: id,
      },
      data: {
        ...body,
      },
    });
    const userByShop = await this.prisma.user.update({
      where: {
        id: shop.user_id,
      },
      data: {
        role: 'Shop',
      },
    });
    if (!shop && userByShop) {
      return null;
    }
    return shop;
  }
}

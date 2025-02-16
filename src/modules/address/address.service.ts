import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}
  // Tạo địa chỉ mới
  async createAddress(userId: number, body: any) {
    // Nếu is_default được đặt thành true, cập nhật các địa chỉ khác thành false
    if (body.is_default) {
      await this.prisma.userAddress.updateMany({
        where: { user_id: userId, is_default: true },
        data: { is_default: false },
      });
    }

    // Tạo địa chỉ mới trong cơ sở dữ liệu
    return this.prisma.userAddress.create({
      data: {
        ...body,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.userAddress.findMany({
      where: { user_id: userId },
    });
  }

  async findOne(id: number) {
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: id,
      },
    });
    if (!address) {
      throw new Error('Đã có lỗi xảy ra vui lòng thử lại sau');
    }
    return address;
  }

  async update(id: number, body: UpdateAddressDto, userId: number) {
    // Kiểm tra xem địa chỉ có tồn tại không
    const existingAddress = await this.prisma.userAddress.findFirst({
      where: { id, user_id: userId }, // Thêm điều kiện kiểm tra `user_id`
    });

    if (!existingAddress) {
      throw new Error(`Địa chỉ với ${id} không tìm thấy`);
    }

    // Đảm bảo địa chỉ thuộc về người dùng hiện tại
    if (existingAddress.user_id !== userId) {
      throw new Error(`Bạn không có quyền cập nhật địa chỉ này`);
    }

    // Nếu `is_default` được đặt thành `true`, cập nhật các địa chỉ khác thành `false`
    if (body.is_default) {
      await this.prisma.userAddress.updateMany({
        where: { user_id: userId, is_default: true },
        data: { is_default: false },
      });
    }

    // Cập nhật địa chỉ
    return this.prisma.userAddress.update({
      where: { id },
      data: {
        ...body,
        updated_at: new Date(),
      },
    });
  }

  remove(id: number) {
    return this.prisma.userAddress.delete({
      where: {
        id: +id,
      },
    });
  }
}

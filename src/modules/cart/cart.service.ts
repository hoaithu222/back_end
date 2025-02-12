import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveCart(userId: number) {
    const activeCart = await this.prisma.cart.findFirst({
      where: {
        user_id: userId,
        status: 'ACTIVE',
      },
      include: {
        cart_items: {
          include: {
            product: true,
            product_variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return activeCart;
  }

  async getCartGroupedByShop(userId: number) {
    const cart = await this.getActiveCart(userId);
    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    const cartItems = await this.prisma.cartItem.findMany({
      where: { cart_id: cart.id },
      include: {
        product: {
          include: {
            product_images: true,
          },
        },
        product_variant: {
          include: {
            product: true,
          },
        },
        shop: true,
      },
    });

    // Nhóm sản phẩm theo shop
    const groupedByShop = cartItems.reduce((acc, item) => {
      const shopId = item.shop.id;
      if (!acc[shopId]) {
        acc[shopId] = {
          shop: item.shop,
          products: [],
          totalQuantity: 0,
        };
      }

      acc[shopId].products.push(item);
      acc[shopId].totalQuantity += item.quantity;

      return acc;
    }, {});

    return Object.values(groupedByShop);
  }
  async getCartItemCounts(userId: number) {
    const cart = await this.getActiveCart(userId);
    if (!cart) {
      return {
        totalQuantity: 0,
        distinctItems: 0,
      };
    }

    const totalQuantity = cart.cart_items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const distinctItems = cart.cart_items.length;

    return {
      totalQuantity,
      distinctItems,
    };
  }
  async addToCart(userId: number, item: CreateCartDto) {
    return await this.prisma.$transaction(async (tx) => {
      // Kiểm tra xem có phải thêm variant hay product
      if (!item.product_id && !item.variant_id) {
        throw new BadRequestException(
          'Vui lòng cung cấp product_id hoặc variant_id',
        );
      }

      let stockAvailable = 0;
      let finalPrice = item.price_at_time;

      if (item.variant_id) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variant_id },
          include: { product: true },
        });

        if (!variant) {
          throw new NotFoundException('Biến thể sản phẩm không tồn tại');
        }

        stockAvailable = variant.stock;
        item.product_id = variant.product_id;
      } else {
        const product = await tx.product.findUnique({
          where: { id: item.product_id },
        });

        if (!product) {
          throw new NotFoundException('Sản phẩm không tồn tại');
        }

        stockAvailable = product.stock_quantity;
        finalPrice = +product.base_price;
      }

      if (stockAvailable < item.quantity) {
        throw new Error('Số lượng sản phẩm trong kho không đủ');
      }

      let cart = await tx.cart.findFirst({
        where: {
          user_id: userId,
          status: 'ACTIVE',
        },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: {
            user_id: userId,
            status: 'ACTIVE',
          },
        });
      }

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cart_id: cart.id,
          ...(item.variant_id
            ? { variant_id: item.variant_id }
            : { product_id: item.product_id, variant_id: null }),
        },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + item.quantity;

        if (newQuantity > stockAvailable) {
          throw new Error('Số lượng vượt quá số lượng trong kho');
        }

        const updatedItem = await tx.cartItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: newQuantity,
            price_at_time: finalPrice,
          },
          include: {
            product: true,
            product_variant: {
              include: {
                product: true,
              },
            },
          },
        });

        return {
          item: updatedItem,
          action: 'UPDATE',
          previousQuantity: existingItem.quantity,
          newQuantity: newQuantity,
        };
      }

      const newItem = await tx.cartItem.create({
        data: {
          cart_id: cart.id,
          product_id: item.product_id,
          shop_id: item.shop_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price_at_time: finalPrice,
        },
        include: {
          product: true,
          product_variant: {
            include: {
              product: true,
            },
          },
        },
      });

      return {
        item: newItem,
        action: 'CREATE',
        quantity: item.quantity,
      };
    });
  }

  async updateCartItem(
    userId: number,
    itemId: number,
    updateData: UpdateCartDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const cart = await this.getActiveCart(userId);
      if (!cart) {
        throw new NotFoundException('Không tìm thấy giỏ hàng');
      }

      const cartItem = cart.cart_items.find((item) => item.id === itemId);
      if (!cartItem) {
        throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
      }

      let stockAvailable = 0;

      if (cartItem.variant_id) {
        const variant = await tx.productVariant.findUnique({
          where: { id: cartItem.variant_id },
        });
        if (!variant) {
          throw new NotFoundException('Biến thể sản phẩm không tồn tại');
        }
        stockAvailable = variant.stock;
      } else {
        const product = await tx.product.findUnique({
          where: { id: cartItem.product_id },
        });
        if (!product) {
          throw new NotFoundException('Sản phẩm không tồn tại');
        }
        stockAvailable = product.stock_quantity;
      }

      if (updateData.quantity > stockAvailable) {
        throw new Error('Số lượng vượt quá số lượng trong kho');
      }

      return await tx.cartItem.update({
        where: {
          id: itemId,
        },
        data: {
          quantity: updateData.quantity,
        },
        include: {
          product: true,
          product_variant: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async removeCartItem(userId: number, itemId: number) {
    const cart = await this.getActiveCart(userId);
    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    const cartItem = cart.cart_items.find((item) => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    await this.prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });
  }

  async getCartTotal(userId: number) {
    const cart = await this.getActiveCart(userId);
    if (!cart) {
      return {
        subtotal: 0,
        itemCount: 0,
      };
    }

    const subtotal = cart.cart_items.reduce(
      (sum, item) => sum + item.price_at_time.toNumber() * item.quantity,
      0,
    );

    const itemCount = cart.cart_items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      subtotal,
      itemCount,
    };
  }
}

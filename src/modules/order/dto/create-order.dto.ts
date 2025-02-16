import { Decimal } from '@prisma/client/runtime/library';
import { OrderStatus } from '@prisma/client';

class ProductDto {
  product_id?: number;
  variant_id?: number;
  quantity: number;
  unit_price: Decimal | number;
  subtotal: Decimal | number;
}

export class CreateOrderDto {
  shop_id: number;
  total_amount: Decimal | number;
  shipping_fee: Decimal | number;
  address_id: number;
  payment_method: string;
  status: OrderStatus;
  products: ProductDto[];
  tracking_number?: string;
  courier_name?: string;
  notes?: string;
  voucher_id?: number;
  discount_amount?: Decimal | number;
  cancellation_reason?: string;
}

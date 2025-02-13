export class CreateOrderDto {
  user_id: number;
  shop_id: number;
  total_amount: number;
  shipping_fee: number;
  address_id: number;
  payment_method: string;
  variant_id?: number;
  product_id?: number;
  quantity?: number;
  unit_price: number;
  subtotal: number;
  cart_id?: number;
  status: string;
}

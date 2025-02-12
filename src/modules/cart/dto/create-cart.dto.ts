export class CreateCartDto {
  user_id: number;
  variant_id?: number;
  product_id?: number;
  shop_id?: number;
  quantity: number;
  price_at_time: number;
}

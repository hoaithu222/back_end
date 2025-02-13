import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  shipping_fee?: number;
  status: string;
  payment_method?: string;
  address_id?: number;
}

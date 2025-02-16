import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  shipping_fee?: number;
  status?: OrderStatus;
  payment_method?: string;
  address_id?: number;
  tracking_number?: string;
  courier_name?: string;
  notes?: string;
  cancellation_reason?: string;
}

export class CreateAddressDto {
  user_id: number;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  district: string;
  ward: string;
  is_default?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

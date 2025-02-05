export class CreateShopDto {
  user_id: number;
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  rating: number;
}

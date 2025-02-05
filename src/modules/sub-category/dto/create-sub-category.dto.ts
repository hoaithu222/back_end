export class CreateSubCategoryDto {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  icon_url?: string;
  display_order: number;
  created_at: Date;
}

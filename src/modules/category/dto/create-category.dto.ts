export class CreateCategoryDto {
  name: string;
  description?: string;
  icon_url?: string;
  img_banner?: string;
  display_order?: number;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  created_at: Date;
}

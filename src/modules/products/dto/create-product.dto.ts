export interface ProductImageDto {
  image_url: string;
  display_order: number;
  is_thumbnail: boolean;
}

export interface ProductVariantDto {
  sku: string;
  combination: Record<string, string>;
  price: number;
  stock: number;
  image_url: string | null;
}

export interface ProductAttributeDto {
  attribute_value_id: number;
}

export class CreateProductDto {
  shop_id: number;
  subcategory_id: number;
  name: string;
  description: string;
  base_price: number;
  stock_quantity: number;
  rating?: number;
  sales_count?: number;
  warranty_info?: string;
  category_path?: string;
  weight: number;
  is_active?: boolean;
  product_images: ProductImageDto[];
  product_attributes: ProductAttributeDto[];
  product_variants: ProductVariantDto[];
}

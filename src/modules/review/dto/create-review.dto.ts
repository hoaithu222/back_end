export interface ReviewImage {
  image_url?: string;
}

export class CreateReviewDto {
  user_id: number;
  product_id: number;
  order_id: number;
  rating: number;
  comment?: string;
  ReviewImage: ReviewImage[];
}

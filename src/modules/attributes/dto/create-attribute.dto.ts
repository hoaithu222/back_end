export class CreateAttributeDto {
  id: number;
  name: string;
  category_id: number[];
  value: string[];
  created_at: Date;
}

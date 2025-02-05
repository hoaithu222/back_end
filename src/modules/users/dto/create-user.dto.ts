export class CreateUserDto {
  username: string;
  fullname: string;
  email: string;
  password: string;
  avatar_url?: string;
  status: boolean;
  phone?: string;
  created_at?: Date;
  updated_at?: Date;
}

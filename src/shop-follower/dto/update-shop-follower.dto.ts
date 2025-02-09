import { PartialType } from '@nestjs/mapped-types';
import { CreateShopFollowerDto } from './create-shop-follower.dto';

export class UpdateShopFollowerDto extends PartialType(CreateShopFollowerDto) {}

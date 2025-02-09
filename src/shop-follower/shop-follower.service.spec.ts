import { Test, TestingModule } from '@nestjs/testing';
import { ShopFollowerService } from './shop-follower.service';

describe('ShopFollowerService', () => {
  let service: ShopFollowerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopFollowerService],
    }).compile();

    service = module.get<ShopFollowerService>(ShopFollowerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

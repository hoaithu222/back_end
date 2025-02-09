import { Test, TestingModule } from '@nestjs/testing';
import { ShopFollowerController } from './shop-follower.controller';
import { ShopFollowerService } from './shop-follower.service';

describe('ShopFollowerController', () => {
  let controller: ShopFollowerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopFollowerController],
      providers: [ShopFollowerService],
    }).compile();

    controller = module.get<ShopFollowerController>(ShopFollowerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

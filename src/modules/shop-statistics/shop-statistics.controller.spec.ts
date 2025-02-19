import { Test, TestingModule } from '@nestjs/testing';
import { ShopStatisticsController } from './shop-statistics.controller';
import { ShopStatisticsService } from './shop-statistics.service';

describe('ShopStatisticsController', () => {
  let controller: ShopStatisticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopStatisticsController],
      providers: [ShopStatisticsService],
    }).compile();

    controller = module.get<ShopStatisticsController>(ShopStatisticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

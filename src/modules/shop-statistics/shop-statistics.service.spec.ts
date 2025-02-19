import { Test, TestingModule } from '@nestjs/testing';
import { ShopStatisticsService } from './shop-statistics.service';

describe('ShopStatisticsService', () => {
  let service: ShopStatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopStatisticsService],
    }).compile();

    service = module.get<ShopStatisticsService>(ShopStatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

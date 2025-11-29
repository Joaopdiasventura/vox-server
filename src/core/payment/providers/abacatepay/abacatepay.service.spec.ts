import { Test, TestingModule } from '@nestjs/testing';
import { AbacatepayService } from './abacatepay.service';

describe('AbacatepayService', () => {
  let service: AbacatepayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbacatepayService],
    }).compile();

    service = module.get<AbacatepayService>(AbacatepayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

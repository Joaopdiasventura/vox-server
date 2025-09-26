import { Test, TestingModule } from '@nestjs/testing';
import { MercadopagoService } from '../mercadopago.service';

describe('MercadopagoService', () => {
  let service: MercadopagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MercadopagoService],
    }).compile();

    service = module.get<MercadopagoService>(MercadopagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

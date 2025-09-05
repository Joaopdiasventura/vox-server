import { Test, TestingModule } from '@nestjs/testing';
import { VoteGateway } from './vote.gateway';

describe('VoteGateway', () => {
  let gateway: VoteGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoteGateway],
    }).compile();

    gateway = module.get<VoteGateway>(VoteGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { VoteController } from '../vote.controller';
import { VoteService } from '../vote.service';
import { CreateVoteDto } from '../dto/create-vote.dto';
import { VoteResult } from '../interfaces/vote-result';
import { AuthRequest } from '../../../shared/interfaces/auth-request';
import { Message } from '../../../shared/interfaces/messages';

describe('VoteController', () => {
  let controller: VoteController;

  const createMock = jest.fn();
  const findResultMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoteController],
      providers: [
        {
          provide: VoteService,
          useValue: {
            create: createMock,
            findResult: findResultMock,
          },
        },
      ],
    })
      .overrideGuard(
        jest.requireActual(
          '../../../shared/modules/auth/guards/auth/auth.guard',
        ).AuthGuard,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VoteController>(VoteController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create to service', async () => {
    const dto = {} as CreateVoteDto;
    const user = 'user-id';
    const req = { user } as unknown as AuthRequest;
    const expected: Message = { message: 'ok' };

    createMock.mockResolvedValue(expected);

    const result = await controller.create(dto, req);

    expect(createMock).toHaveBeenCalledWith(dto, user);
    expect(result).toEqual(expected);
  });

  it('should delegate findResult to service', async () => {
    const session = 'session-id';
    const expected = [{} as VoteResult];

    findResultMock.mockResolvedValue(expected);

    const result = await controller.findResult(session);

    expect(findResultMock).toHaveBeenCalledWith(session);
    expect(result).toEqual(expected);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { VoteService } from '../vote.service';
import { IVoteRepository } from '../repositories/vote.repository';
import { VoteGateway } from '../vote.gateway';
import { UserService } from '../../user/user.service';
import { SessionService } from '../../session/session.service';
import { CandidateService } from '../../candidate/candidate.service';
import { CreateVoteDto } from '../dto/create-vote.dto';

type VoteRepositoryMock = {
  create: jest.Mock;
  findResult: jest.Mock;
};

type VoteGatewayMock = {
  onVoteCreated: jest.Mock;
};

type UserServiceMock = {
  findById: jest.Mock;
};

type SessionServiceMock = {
  findById: jest.Mock;
  addVote: jest.Mock;
};

type CandidateServiceMock = {
  findById: jest.Mock;
};

describe('VoteService', () => {
  let service: VoteService;
  let repo: VoteRepositoryMock;
  let gateway: VoteGatewayMock;
  let userService: UserServiceMock;
  let sessionService: SessionServiceMock;
  let candidateService: CandidateServiceMock;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findResult: jest.fn(),
    };

    gateway = {
      onVoteCreated: jest.fn(),
    };

    userService = {
      findById: jest.fn(),
    };

    sessionService = {
      findById: jest.fn(),
      addVote: jest.fn(),
    };

    candidateService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoteService,
        { provide: IVoteRepository, useValue: repo },
        { provide: VoteGateway, useValue: gateway },
        { provide: UserService, useValue: userService },
        { provide: SessionService, useValue: sessionService },
        { provide: CandidateService, useValue: candidateService },
      ],
    }).compile();

    service = module.get<VoteService>(VoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repository and gateway on create', async () => {
    const dto = {
      session: 'session-id',
    } as unknown as CreateVoteDto;

    sessionService.findById.mockResolvedValue({
      endedAt: new Date(Date.now() + 1000 * 60),
      votes: 0,
    });

    userService.findById.mockResolvedValue({
      votes: 10,
    });

    repo.create.mockResolvedValue({ id: 'vote-id', session: 'session-id' });

    await service.create(dto, 'user-id');

    expect(sessionService.findById).toHaveBeenCalledWith('session-id');
    expect(userService.findById).toHaveBeenCalledWith('user-id');
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(sessionService.addVote).toHaveBeenCalledWith('session-id');
    expect(gateway.onVoteCreated).toHaveBeenCalled();
  });

  it('should delegate findResult to repository', async () => {
    const expected = [{ candidate: '1', value: 10 }];
    repo.findResult.mockResolvedValue(expected);

    const result = await service.findResult('session-id');

    expect(repo.findResult).toHaveBeenCalledWith('session-id');
    expect(result).toEqual(expected);
  });
});

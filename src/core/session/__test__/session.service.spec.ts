import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '../session.service';
import { ISessionRepository } from '../repositories/session.repository';
import { ElectionService } from '../../election/election.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { FindSessionDto } from '../dto/find-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { Session } from '../entities/session.entity';

type SessionRepositoryMock = {
  create: jest.Mock;
  findMany: jest.Mock;
  findById: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  addVote: jest.Mock;
};

type ElectionServiceMock = {
  findById: jest.Mock;
};

describe('SessionService', () => {
  let service: SessionService;
  let repo: SessionRepositoryMock;
  let electionService: ElectionServiceMock;

  const sessionRepositoryMock: SessionRepositoryMock = {
    create: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addVote: jest.fn(),
  };

  const electionServiceMock: ElectionServiceMock = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: ISessionRepository,
          useValue: sessionRepositoryMock,
        },
        {
          provide: ElectionService,
          useValue: electionServiceMock,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    repo = sessionRepositoryMock;
    electionService = electionServiceMock;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException when startedAt > endedAt', async () => {
      const dto = {
        startedAt: new Date('2024-02-02'),
        endedAt: new Date('2024-02-01'),
        elections: [],
      } as unknown as CreateSessionDto;

      await expect(service.create(dto, 'user')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when election user differs from creator', async () => {
      const dto = {
        startedAt: new Date('2024-02-01'),
        endedAt: new Date('2024-02-02'),
        elections: ['e1'],
      } as unknown as CreateSessionDto;

      electionService.findById.mockResolvedValueOnce({
        user: 'other',
      });

      await expect(service.create(dto, 'user')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should create session when data is valid', async () => {
      const dto = {
        startedAt: new Date('2024-02-01'),
        endedAt: new Date('2024-02-02'),
        elections: ['e1', 'e2'],
      } as unknown as CreateSessionDto;

      electionService.findById
        .mockResolvedValueOnce({ user: 'user' })
        .mockResolvedValueOnce({ user: 'user' });

      const result = await service.create(dto, 'user');

      expect(electionService.findById).toHaveBeenCalledTimes(2);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('criada com sucesso');
    });
  });

  describe('findMany', () => {
    it('should delegate to repository', async () => {
      const dto = {} as FindSessionDto;
      const expected = [{} as Session];

      repo.findMany.mockResolvedValue(expected);

      const result = await service.findMany('user', dto);

      expect(repo.findMany).toHaveBeenCalledWith('user', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findById', () => {
    it('should return session when found', async () => {
      const session = { id: '1' } as unknown as Session;
      repo.findById.mockResolvedValue(session);

      const result = await service.findById('1');

      expect(repo.findById).toHaveBeenCalledWith('1');
      expect(result).toBe(session);
    });

    it('should throw NotFoundException when session not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should throw UnauthorizedException when session already ended', async () => {
      const endedSession = {
        endedAt: new Date(Date.now() - 1000),
      } as unknown as Session;
      repo.findById.mockResolvedValue(endedSession);

      await expect(
        service.update('1', {} as UpdateSessionDto),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should update session when not ended', async () => {
      const futureSession = {
        endedAt: new Date(Date.now() + 1000 * 60),
      } as unknown as Session;
      repo.findById.mockResolvedValue(futureSession);

      const result = await service.update('1', {} as UpdateSessionDto);

      expect(repo.update).toHaveBeenCalledWith('1', expect.any(Object));
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('atualizada com sucesso');
    });
  });

  describe('addVote', () => {
    it('should delegate to repository', async () => {
      await service.addVote('1');
      expect(repo.addVote).toHaveBeenCalledWith('1');
    });
  });

  describe('delete', () => {
    it('should throw ForbiddenException when session has votes', async () => {
      repo.findById.mockResolvedValue({
        votes: 1,
      } as unknown as Session);

      await expect(service.delete('1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('should delete session when there are no votes', async () => {
      repo.findById.mockResolvedValue({
        votes: 0,
      } as unknown as Session);

      const result = await service.delete('1');

      expect(repo.delete).toHaveBeenCalledWith('1');
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('deletada com sucesso');
    });
  });
});

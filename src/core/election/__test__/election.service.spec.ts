import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ElectionService } from '../election.service';
import { IElectionRepository } from '../repositories/election.repository';
import { UserService } from '../../user/user.service';
import { CreateElectionDto } from '../dto/create-election.dto';
import { FindElectionDto } from '../dto/find-election.dto';
import { UpdateElectionDto } from '../dto/update-election.dto';
import { Election } from '../entities/election.entity';

type ElectionRepositoryMock = {
  create: jest.Mock;
  findById: jest.Mock;
  findMany: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

type UserServiceMock = {
  findById: jest.Mock;
};

describe('ElectionService', () => {
  let service: ElectionService;
  let repo: ElectionRepositoryMock;
  let userService: UserServiceMock;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    userService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElectionService,
        { provide: IElectionRepository, useValue: repo },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    service = module.get<ElectionService>(ElectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create election after validating user', async () => {
    const dto = {
      user: 'user-id',
    } as unknown as CreateElectionDto;

    const result = await service.create(dto);

    expect(userService.findById).toHaveBeenCalledWith('user-id');
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('message');
  });

  it('should throw when election not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById('id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should return election when found', async () => {
    const election = { id: 'id' } as unknown as Election;
    repo.findById.mockResolvedValue(election);

    const result = await service.findById('id');

    expect(repo.findById).toHaveBeenCalledWith('id');
    expect(result).toBe(election);
  });

  it('should delegate findMany to repository', async () => {
    const dto = {} as FindElectionDto;
    const expected = [{} as Election];

    repo.findMany.mockResolvedValue(expected);

    const result = await service.findMany('user-id', dto);

    expect(repo.findMany).toHaveBeenCalledWith('user-id', dto);
    expect(result).toEqual(expected);
  });

  it('should update election after verifying existence', async () => {
    repo.findById.mockResolvedValue({ id: 'id' } as unknown as Election);

    const dto = {} as UpdateElectionDto;

    const result = await service.update('id', dto);

    expect(repo.update).toHaveBeenCalledWith('id', dto);
    expect(result).toHaveProperty('message');
  });

  it('should delete election after verifying existence', async () => {
    repo.findById.mockResolvedValue({ id: 'id' } as unknown as Election);

    const result = await service.delete('id');

    expect(repo.delete).toHaveBeenCalledWith('id');
    expect(result).toHaveProperty('message');
  });
});

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CandidateService } from '../candidate.service';
import { ICandidateRepository } from '../repositories/candidate.repository';
import { ElectionService } from '../../election/election.service';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { FindCandidateDto } from '../dto/find-candidate.dto';
import { UpdateCandidateDto } from '../dto/update-candidate.dto';
import { Candidate } from '../entities/candidate.entity';

type CandidateRepositoryMock = {
  create: jest.Mock;
  findById: jest.Mock;
  findMany: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

type ElectionServiceMock = {
  findById: jest.Mock;
};

describe('CandidateService', () => {
  let service: CandidateService;
  let repo: CandidateRepositoryMock;
  let electionService: ElectionServiceMock;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    electionService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        { provide: ICandidateRepository, useValue: repo },
        { provide: ElectionService, useValue: electionService },
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create candidate after validating election', async () => {
    const dto = {
      election: 'election-id',
    } as unknown as CreateCandidateDto;

    await service.create(dto);

    expect(electionService.findById).toHaveBeenCalledWith('election-id');
    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  it('should throw when candidate not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById('id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should return candidate when found', async () => {
    const candidate = { id: 'id' } as unknown as Candidate;
    repo.findById.mockResolvedValue(candidate);

    const result = await service.findById('id');

    expect(repo.findById).toHaveBeenCalledWith('id');
    expect(result).toBe(candidate);
  });

  it('should delegate findMany to repository', async () => {
    const dto = {} as FindCandidateDto;
    const expected = [{} as Candidate];

    repo.findMany.mockResolvedValue(expected);

    const result = await service.findMany('user-id', dto);

    expect(repo.findMany).toHaveBeenCalledWith('user-id', dto);
    expect(result).toEqual(expected);
  });

  it('should update candidate and validate new election when provided', async () => {
    repo.findById.mockResolvedValue({
      election: { id: 'election-old' },
    } as unknown as Candidate);

    const dto = {
      election: 'election-new',
    } as unknown as UpdateCandidateDto;

    const result = await service.update('candidate-id', dto);

    expect(electionService.findById).toHaveBeenCalledWith('election-new');
    expect(repo.update).toHaveBeenCalledWith('candidate-id', dto);
    expect(result).toHaveProperty('message');
  });

  it('should delete candidate after verifying existence', async () => {
    repo.findById.mockResolvedValue({ id: 'id' } as unknown as Candidate);

    const result = await service.delete('id');

    expect(repo.delete).toHaveBeenCalledWith('id');
    expect(result).toHaveProperty('message');
  });
});

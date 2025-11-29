import { CandidateController } from '../candidate.controller';
import type { CandidateService } from '../candidate.service';
import type { CreateCandidateDto } from '../dto/create-candidate.dto';
import type { FindCandidateDto } from '../dto/find-candidate.dto';
import type { UpdateCandidateDto } from '../dto/update-candidate.dto';
import type { Candidate } from '../entities/candidate.entity';
import type { AuthRequest } from '../../../shared/interfaces/auth-request';
import type { Message } from '../../../shared/interfaces/messages';

type CandidateServiceMock = {
  create: jest.Mock;
  findMany: jest.Mock;
  findById: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

describe('CandidateController', () => {
  let controller: CandidateController;
  let service: CandidateServiceMock;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    controller = new CandidateController(
      service as unknown as CandidateService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create to service', async () => {
    const dto = {} as CreateCandidateDto;
    const expected: Message = { message: 'created' };

    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('should delegate findMany to service', async () => {
    const req = { user: 'user-id' } as unknown as AuthRequest;
    const query = {} as FindCandidateDto;
    const expected = [{} as Candidate];

    service.findMany.mockResolvedValue(expected);

    const result = await controller.findMany(req, query);

    expect(service.findMany).toHaveBeenCalledWith('user-id', query);
    expect(result).toEqual(expected);
  });

  it('should delegate findById to service', async () => {
    const expected = { id: 'candidate-id' } as unknown as Candidate;
    service.findById.mockResolvedValue(expected);

    const result = await controller.findById('candidate-id');

    expect(service.findById).toHaveBeenCalledWith('candidate-id');
    expect(result).toEqual(expected);
  });

  it('should delegate update to service', async () => {
    const dto = {} as UpdateCandidateDto;
    const expected: Message = { message: 'updated' };

    service.update.mockResolvedValue(expected);

    const result = await controller.update('candidate-id', dto);

    expect(service.update).toHaveBeenCalledWith('candidate-id', dto);
    expect(result).toEqual(expected);
  });

  it('should delegate delete to service', async () => {
    const expected: Message = { message: 'deleted' };

    service.delete.mockResolvedValue(expected);

    const result = await controller.delete('candidate-id');

    expect(service.delete).toHaveBeenCalledWith('candidate-id');
    expect(result).toEqual(expected);
  });
});

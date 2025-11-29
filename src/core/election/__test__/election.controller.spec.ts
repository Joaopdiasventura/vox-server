import { ElectionController } from '../election.controller';
import type { ElectionService } from '../election.service';
import type { CreateElectionDto } from '../dto/create-election.dto';
import type { FindElectionDto } from '../dto/find-election.dto';
import type { UpdateElectionDto } from '../dto/update-election.dto';
import type { Election } from '../entities/election.entity';
import type { AuthRequest } from '../../../shared/interfaces/auth-request';
import type { Message } from '../../../shared/interfaces/messages';

type ElectionServiceMock = {
  create: jest.Mock;
  findMany: jest.Mock;
  findById: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

describe('ElectionController', () => {
  let controller: ElectionController;
  let service: ElectionServiceMock;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    controller = new ElectionController(service as unknown as ElectionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create to service', async () => {
    const dto = {} as CreateElectionDto;
    const expected: Message = { message: 'created' };

    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('should delegate findMany to service', async () => {
    const req = { user: 'user-id' } as unknown as AuthRequest;
    const query = {} as FindElectionDto;
    const expected = [{} as Election];

    service.findMany.mockResolvedValue(expected);

    const result = await controller.findMany(req, query);

    expect(service.findMany).toHaveBeenCalledWith('user-id', query);
    expect(result).toEqual(expected);
  });

  it('should delegate findById to service', async () => {
    const expected = { id: 'election-id' } as unknown as Election;
    service.findById.mockResolvedValue(expected);

    const result = await controller.findById('election-id');

    expect(service.findById).toHaveBeenCalledWith('election-id');
    expect(result).toEqual(expected);
  });

  it('should delegate update to service', async () => {
    const dto = {} as UpdateElectionDto;
    const expected: Message = { message: 'updated' };

    service.update.mockResolvedValue(expected);

    const result = await controller.update('election-id', dto);

    expect(service.update).toHaveBeenCalledWith('election-id', dto);
    expect(result).toEqual(expected);
  });

  it('should delegate delete to service', async () => {
    const expected: Message = { message: 'deleted' };

    service.delete.mockResolvedValue(expected);

    const result = await controller.delete('election-id');

    expect(service.delete).toHaveBeenCalledWith('election-id');
    expect(result).toEqual(expected);
  });
});

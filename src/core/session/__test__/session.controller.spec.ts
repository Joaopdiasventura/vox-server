import { SessionController } from '../session.controller';
import { SessionService } from '../session.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { FindSessionDto } from '../dto/find-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { Session } from '../entities/session.entity';
import { AuthRequest } from '../../../shared/interfaces/auth-request';
import { Message } from '../../../shared/interfaces/messages';

type SessionServiceMock = {
  create: jest.Mock;
  findMany: jest.Mock;
  findById: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

describe('SessionController', () => {
  let controller: SessionController;
  let service: SessionServiceMock;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    controller = new SessionController(service as unknown as SessionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create to service', async () => {
    const dto = {} as CreateSessionDto;
    const user = 'user-id';
    const req = { user } as unknown as AuthRequest;
    const expected: Message = { message: 'ok' };

    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto, req);

    expect(service.create).toHaveBeenCalledWith(dto, user);
    expect(result).toEqual(expected);
  });

  it('should delegate findMany to service', async () => {
    const user = 'user-id';
    const req = { user } as unknown as AuthRequest;
    const query = {} as FindSessionDto;
    const expected = [{} as Session];

    service.findMany.mockResolvedValue(expected);

    const result = await controller.findMany(req, query);

    expect(service.findMany).toHaveBeenCalledWith(user, query);
    expect(result).toEqual(expected);
  });

  it('should delegate findById to service', async () => {
    const id = 'session-id';
    const expected = { id } as unknown as Session;

    service.findById.mockResolvedValue(expected);

    const result = await controller.findById(id);

    expect(service.findById).toHaveBeenCalledWith(id);
    expect(result).toEqual(expected);
  });

  it('should delegate update to service', async () => {
    const id = 'session-id';
    const dto = {} as UpdateSessionDto;
    const expected: Message = { message: 'updated' };

    service.update.mockResolvedValue(expected);

    const result = await controller.update(id, dto);

    expect(service.update).toHaveBeenCalledWith(id, dto);
    expect(result).toEqual(expected);
  });

  it('should delegate delete to service', async () => {
    const id = 'session-id';
    const expected: Message = { message: 'deleted' };

    service.delete.mockResolvedValue(expected);

    const result = await controller.delete(id);

    expect(service.delete).toHaveBeenCalledWith(id);
    expect(result).toEqual(expected);
  });
});

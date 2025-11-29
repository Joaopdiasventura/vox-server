import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { BallotBoxService } from '../ballot-box.service';
import type { CreateBallotBoxDto } from '../dto/create-ballot-box.dto';
import type { UpdateBallotBoxDto } from '../dto/update-ballot-box.dto';
import type { BallotBox } from '../entities/ballot-box.entity';

type CacheMock = {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
};

describe('BallotBoxService', () => {
  let service: BallotBoxService;
  let cache: CacheMock;
  let emit: jest.Mock;

  beforeEach(async () => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BallotBoxService,
        {
          provide: CACHE_MANAGER,
          useValue: cache,
        },
      ],
    }).compile();

    service = module.get<BallotBoxService>(BallotBoxService);
    emit = jest.fn();
    (service as unknown as { server: { emit: jest.Mock } }).server = {
      emit,
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create ballot box and emit event', async () => {
    const dto = {
      session: 'session-id',
    } as unknown as CreateBallotBoxDto;

    cache.get.mockResolvedValueOnce(undefined);

    await service.create(dto, 'socket-id');

    expect(cache.set).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith(
      'ballot-box-created-session-id',
      expect.any(Object),
    );
  });

  it('should return all ballot boxes for session', async () => {
    const box = { id: 'box', session: 'session-id' } as unknown as BallotBox;
    const map = new Map<string, BallotBox>([['box', box]]);

    cache.get.mockResolvedValueOnce(map);

    const result = await service.findAll('session-id');

    expect(cache.get).toHaveBeenCalled();
    expect(result).toEqual([box]);
  });

  it('should update ballot box when it exists', async () => {
    const dto = {
      id: 'box',
      session: 'session-id',
      isBlocked: true,
      name: 'New name',
    } as unknown as UpdateBallotBoxDto;

    const existing = {
      id: 'box',
      session: 'session-id',
      isBlocked: false,
      name: 'Old',
    } as unknown as BallotBox;

    const map = new Map<string, BallotBox>([['box', existing]]);

    cache.get.mockResolvedValueOnce(map);

    await service.update(dto);

    expect(cache.set).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith(
      'ballot-box-updated-box',
      expect.any(Object),
    );
  });

  it('should ignore update when ballot box does not exist', async () => {
    cache.get.mockResolvedValueOnce(new Map());

    await service.update({
      id: 'box',
      session: 'session-id',
    } as unknown as UpdateBallotBoxDto);

    expect(cache.set).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('should remove ballot box by socket id and emit event', async () => {
    cache.get
      .mockResolvedValueOnce({ session: 'session-id', id: 'box' }) // index
      .mockResolvedValueOnce(
        new Map<string, BallotBox>([
          ['box', { id: 'box', session: 'session-id' } as unknown as BallotBox],
        ]),
      );

    await service.removeBySocketId('socket-id');

    expect(cache.set).toHaveBeenCalled();
    expect(cache.del).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith(
      'ballot-box-removed-session-id',
      expect.any(Object),
    );
  });

  it('should ignore remove when socket index is missing', async () => {
    cache.get.mockResolvedValueOnce(undefined);

    await service.removeBySocketId('socket-id');

    expect(cache.set).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});

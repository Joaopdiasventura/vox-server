import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { UserGateway } from '../user.gateway';
import type { Socket } from 'socket.io';
import type { User } from '../entities/user.entity';

type CacheMock = {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
};

describe('UserGateway', () => {
  let gateway: UserGateway;
  let cache: CacheMock;
  let emit: jest.Mock;
  let to: jest.Mock;

  beforeEach(async () => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGateway,
        {
          provide: CACHE_MANAGER,
          useValue: cache,
        },
      ],
    }).compile();

    gateway = module.get<UserGateway>(UserGateway);
    emit = jest.fn();
    to = jest.fn(() => ({ emit }));
    (gateway as unknown as { server: { to: jest.Mock } }).server = {
      to,
    };
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should ignore connection when email is missing', async () => {
    const client = {
      id: 'socket-id',
      handshake: { query: {} },
    } as unknown as Socket;

    await gateway.handleConnection(client);

    expect(cache.set).not.toHaveBeenCalled();
  });

  it('should handle connection and store socket id', async () => {
    const client = {
      id: 'socket-id',
      handshake: { query: { email: 'user@test.com' } },
    } as unknown as Socket;

    cache.get.mockResolvedValueOnce(undefined).mockResolvedValueOnce([]);

    await gateway.handleConnection(client);

    expect(cache.set).toHaveBeenCalled();
  });

  it('should handle disconnect and clean up socket id', async () => {
    const client = {
      id: 'socket-id',
    } as unknown as Socket;

    cache.get
      .mockResolvedValueOnce(['user@test.com'])
      .mockResolvedValueOnce(['socket-id']);

    await gateway.handleDisconnect(client);

    expect(cache.del).toHaveBeenCalled();
  });

  it('should notify sockets when account is validated', async () => {
    const user = {
      email: 'user@test.com',
    } as unknown as User;

    cache.get.mockResolvedValueOnce(['socket-1', 'socket-2']);

    await gateway.onAccountValidated(user);

    expect(to).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith('email-validated', user);
    expect(cache.del).toHaveBeenCalled();
  });

  it('should do nothing when there are no sockets on validation', async () => {
    const user = {
      email: 'user@test.com',
    } as unknown as User;

    cache.get.mockResolvedValueOnce(undefined);

    await gateway.onAccountValidated(user);

    expect(to).not.toHaveBeenCalled();
  });
});

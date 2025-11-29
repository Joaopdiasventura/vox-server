import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';

type JwtServiceMock = {
  signAsync: jest.Mock;
  verifyAsync: jest.Mock;
};

type ConfigServiceMock = {
  get: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let jwt: JwtServiceMock;
  let config: ConfigServiceMock;

  beforeEach(async () => {
    jwt = {
      signAsync: jest.fn((sub: string) => `token-${sub}`),
      verifyAsync: jest.fn((token: string) => token.replace('token-', '')),
    };

    config = {
      get: jest.fn((key: string) => {
        if (key == 'salts') return 10;
        if (key == 'randomPasswordSize') return 12;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate and decode token', async () => {
    const token = await service.generateToken('sub-id');
    expect(token).toBe('token-sub-id');

    const decoded = await service.decodeToken(token);
    expect(decoded).toBe('sub-id');
  });

  it('should generate random password with minimum size', () => {
    const password = service.generateRandomPassword();
    expect(password).toHaveLength(12);
  });
});

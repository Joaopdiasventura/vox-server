import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { IUserRepository } from '../repositories/user.repository';
import { UserGateway } from '../user.gateway';
import { AuthService } from '../../../shared/modules/auth/auth.service';
import { EmailService } from '../../../shared/modules/email/email.service';

type UserRepositoryMock = {
  create: jest.Mock;
  findById: jest.Mock;
  findByEmail: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

type UserGatewayMock = {
  onAccountValidated: jest.Mock;
};

type AuthServiceMock = {
  hashPassword: jest.Mock;
  generateToken: jest.Mock;
  decodeToken: jest.Mock;
  comparePassword: jest.Mock;
  generateRandomPassword: jest.Mock;
};

type EmailServiceMock = {
  enqueueMail: jest.Mock;
  createAccountValidationMessage: jest.Mock;
  createNewPasswordMessage: jest.Mock;
};

describe('UserService', () => {
  let service: UserService;
  let repo: UserRepositoryMock;
  let gateway: UserGatewayMock;
  let auth: AuthServiceMock;
  let email: EmailServiceMock;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    gateway = {
      onAccountValidated: jest.fn(),
    };

    auth = {
      hashPassword: jest.fn(),
      generateToken: jest.fn(),
      decodeToken: jest.fn(),
      comparePassword: jest.fn(),
      generateRandomPassword: jest.fn(),
    };

    email = {
      enqueueMail: jest.fn(),
      createAccountValidationMessage: jest.fn(() => '<html />'),
      createNewPasswordMessage: jest.fn(() => '<html />'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: IUserRepository, useValue: repo },
        { provide: UserGateway, useValue: gateway },
        { provide: AuthService, useValue: auth },
        { provide: EmailService, useValue: email },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

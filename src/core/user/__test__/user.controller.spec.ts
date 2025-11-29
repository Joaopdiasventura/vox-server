import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { AuthService } from '../../../shared/modules/auth/auth.service';
import { AuthRequest } from '../../../shared/interfaces/auth-request';
import { Message } from '../../../shared/interfaces/messages';
import { AuthMessage } from '../../../shared/interfaces/messages/auth';

type UserServiceMock = {
  create: jest.Mock;
  login: jest.Mock;
  decodeToken: jest.Mock;
  update: jest.Mock;
  validateAccount: jest.Mock;
  resetPassword: jest.Mock;
  delete: jest.Mock;
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserServiceMock;
  let authService: { decodeToken: jest.Mock };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      login: jest.fn(),
      decodeToken: jest.fn(),
      update: jest.fn(),
      validateAccount: jest.fn(),
      resetPassword: jest.fn(),
      delete: jest.fn(),
    };

    authService = {
      decodeToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: service,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create to service', async () => {
    const dto = {} as CreateUserDto;
    const expected: Message = { message: 'ok' };

    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('should delegate login to service', async () => {
    const dto = {} as LoginUserDto;
    const expected = { token: 'token' } as AuthMessage;

    service.login.mockResolvedValue(expected);

    const result = await controller.login(dto);

    expect(service.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('should delegate decodeToken to service', async () => {
    const expected = {} as User;
    service.decodeToken.mockResolvedValue(expected);

    const result = await controller.decodeToken('token');

    expect(service.decodeToken).toHaveBeenCalledWith('token');
    expect(result).toEqual(expected);
  });

  it('should delegate update to service', async () => {
    const req = { user: 'user-id' } as unknown as AuthRequest;
    const dto = {} as UpdateUserDto;
    const expected: Message = { message: 'updated' };

    service.update.mockResolvedValue(expected);

    const result = await controller.update(req, dto);

    expect(service.update).toHaveBeenCalledWith('user-id', dto);
    expect(result).toEqual(expected);
  });

  it('should delegate validateAccount to service', async () => {
    const expected = {} as User;
    service.validateAccount.mockResolvedValue(expected);

    const result = await controller.validateAccount('token');

    expect(service.validateAccount).toHaveBeenCalledWith('token');
    expect(result).toEqual(expected);
  });

  it('should delegate resetPassword to service', async () => {
    await controller.resetPassword('email@test.com');

    expect(service.resetPassword).toHaveBeenCalledWith('email@test.com');
  });

  it('should delegate delete to service', async () => {
    const req = { user: 'user-id' } as unknown as AuthRequest;
    const expected: Message = { message: 'deleted' };

    service.delete.mockResolvedValue(expected);

    const result = await controller.delete(req);

    expect(service.delete).toHaveBeenCalledWith('user-id');
    expect(result).toEqual(expected);
  });
});

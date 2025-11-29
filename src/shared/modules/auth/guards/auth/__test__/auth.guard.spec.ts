import { ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { AuthService } from '../../../auth.service';
import { ExecutionContext } from '@nestjs/common';

type AuthServiceMock = {
  decodeToken: jest.Mock;
};

type MockRequest = {
  headers: { authorization?: string };
};

const createExecutionContext = (token?: string): ExecutionContext => {
  const req: MockRequest = {
    headers: { authorization: token },
  };

  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as ExecutionContext;
};

describe('AuthGuard', () => {
  let authService: AuthServiceMock;
  let guard: AuthGuard;

  beforeEach(() => {
    authService = {
      decodeToken: jest.fn(() => 'user-id'),
    };

    guard = new AuthGuard(authService as unknown as AuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw ForbiddenException when token is missing', () =>
    expect(guard.canActivate(createExecutionContext())).rejects.toBeInstanceOf(
      ForbiddenException,
    ));

  it('should decode token and attach user', () =>
    expect(guard.canActivate(createExecutionContext('token'))).resolves.toBe(
      true,
    ));
});

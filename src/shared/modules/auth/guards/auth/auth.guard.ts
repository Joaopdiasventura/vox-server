import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { AuthRequest } from '../../../../interfaces/auth-request';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly authService: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = request.headers.authorization;
    if (!token) throw new ForbiddenException('Faça login novamente');
    request.user = await this.authService.decodeToken(token);
    return true;
  }
}

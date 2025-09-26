import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { UserService } from "src/core/user/user.service";
import { AuthRequest } from "../../../../interfaces/auth-request";

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly userService: UserService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = request.headers.authorization;
    if (!token) throw new ForbiddenException("Faça login novamente");
    const user = await this.userService.decodeToken(token);
    request.user = user;
    return true;
  }
}

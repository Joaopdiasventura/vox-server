import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Param,
  UseGuards,
  Patch,
  Req,
  Delete,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Message } from '../../shared/interfaces/messages';
import { AuthMessage } from '../../shared/interfaces/messages/auth';
import { AuthGuard } from '../../shared/modules/auth/guards/auth/auth.guard';
import type { AuthRequest } from '../../shared/interfaces/auth-request';

@Controller('user')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Post()
  public create(@Body() createUserDto: CreateUserDto): Promise<Message> {
    return this.userService.create(createUserDto);
  }

  @HttpCode(200)
  @Post('login')
  public login(@Body() loginUserDto: LoginUserDto): Promise<AuthMessage> {
    return this.userService.login(loginUserDto);
  }

  @Get('decodeToken/:token')
  public decodeToken(@Param('token') token: string): Promise<User> {
    return this.userService.decodeToken(token);
  }

  @UseGuards(AuthGuard)
  @Patch()
  public update(
    @Req() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Message> {
    return this.userService.update(req.user, updateUserDto);
  }

  @Patch('validateAccount/:token')
  public validateAccount(@Param('token') token: string): Promise<User> {
    return this.userService.validateAccount(token);
  }

  @Patch('resetPassword/:email')
  public resetPassword(@Param('email') email: string): Promise<void> {
    return this.userService.resetPassword(email);
  }

  @UseGuards(AuthGuard)
  @Delete()
  public delete(@Req() req: AuthRequest): Promise<Message> {
    return this.userService.delete(req.user);
  }
}

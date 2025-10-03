import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { User } from "./entities/user.entity";
import { Message } from "../../shared/interfaces/messages";
import { AuthMessage } from "../../shared/interfaces/messages/auth";
import { ParseLoginUserDtoPipe } from "../../shared/pipes/parse-login-user-dto/parse-login-user-dto.pipe";
import { AuthGuard } from "../../shared/modules/auth/guards/auth/auth.guard";

@Controller("user")
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Post()
  public create(@Body() createUserDto: CreateUserDto): Promise<AuthMessage> {
    return this.userService.create(createUserDto);
  }

  @Post("login")
  public login(
    @Body(ParseLoginUserDtoPipe) loginUserDto: LoginUserDto,
  ): Promise<AuthMessage> {
    return this.userService.login(loginUserDto);
  }

  @Get("decodeToken/:token")
  public decodeToken(@Param("token") token: string): Promise<User> {
    return this.userService.decodeToken(token);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  public update(
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Message> {
    return this.userService.update(id, updateUserDto);
  }

  @Patch("validateEmail/:token")
  @UseGuards(AuthGuard)
  public validateEmail(@Param("token") token: string): Promise<Message> {
    return this.userService.validateEmail(token);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  public delete(@Param("id", ParseObjectIdPipe) id: string): Promise<Message> {
    return this.userService.delete(id);
  }
}

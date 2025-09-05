import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { User } from "./entities/user.entity";
import { Message } from "../../shared/interfaces/messages";
import { AuthMessage } from "../../shared/interfaces/messages/auth";
import { ParseLoginUserDtoPipe } from "../../shared/pipes/parse-login-user-dto/parse-login-user-dto.pipe";
import { ParseObjectIdPipe } from "@nestjs/mongoose";

@Controller("user")
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Post()
  public create(@Body() createUserDto: CreateUserDto): Promise<AuthMessage> {
    return this.userService.create(createUserDto);
  }

  @Get("login")
  public login(
    @Query(ParseLoginUserDtoPipe) loginUserDto: LoginUserDto,
  ): Promise<AuthMessage> {
    return this.userService.login(loginUserDto);
  }

  @Get("decodeToken/:token")
  public decodeToken(@Param("token") token: string): Promise<User> {
    return this.userService.decodeToken(token);
  }

  @Patch(":id")
  public update(
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Message> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(":id")
  public delete(@Param("id", ParseObjectIdPipe) id: string): Promise<Message> {
    return this.userService.delete(id);
  }
}

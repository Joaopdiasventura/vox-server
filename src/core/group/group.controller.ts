import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GroupService } from "./group.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { Message } from "../../shared/interfaces/messages";
import { Group } from "./entities/group.entity";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { FindGroupDto } from "./dto/find-group.dto";
import { AuthGuard } from "../../shared/modules/auth/guards/auth/auth.guard";

@Controller("group")
@UseGuards(AuthGuard)
export class GroupController {
  public constructor(private readonly groupService: GroupService) {}

  @Post()
  public create(@Body() createGroupDto: CreateGroupDto): Promise<Message> {
    return this.groupService.create(createGroupDto);
  }

  @Get("findById/:id")
  public findById(@Param("id", ParseObjectIdPipe) id: string): Promise<Group> {
    return this.groupService.findById(id);
  }

  @Get("findMany/:user")
  public findMany(
    @Param("user", ParseObjectIdPipe) user: string,
    @Query() findGroupDto: FindGroupDto,
  ): Promise<Group[]> {
    return this.groupService.findMany(user, findGroupDto);
  }

  @Patch(":id")
  public update(
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Message> {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(":id")
  public delete(@Param("id", ParseObjectIdPipe) id: string): Promise<Message> {
    return this.groupService.delete(id);
  }
}

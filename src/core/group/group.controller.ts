import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { GroupService } from "./group.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { Message } from "../../shared/interfaces/messages";
import { Group } from "./entities/group.entity";
import { ParseObjectIdPipe } from "@nestjs/mongoose";

@Controller("group")
export class GroupController {
  public constructor(private readonly groupService: GroupService) {}

  @Post()
  public create(@Body() createGroupDto: CreateGroupDto): Promise<Message> {
    return this.groupService.create(createGroupDto);
  }

  @Get("findManyByUser/:user/:name")
  public findManyByUser(
    @Param("user", ParseObjectIdPipe) user: string,
    @Param("name") name: string,
  ): Promise<Group[]> {
    return this.groupService.findManyByUser(user, name);
  }

  @Get("findManyByGroup/:group/:name")
  public findManyByGroup(
    @Param("group", ParseObjectIdPipe) group: string,
    @Param("name") name: string,
  ): Promise<Group[]> {
    return this.groupService.findManyByGroup(group, name);
  }

  @Get("findAllWithoutSubGroups/:user")
  public findAllWithoutSubGroups(
    @Param("user", ParseObjectIdPipe) user: string,
  ): Promise<Group[]> {
    return this.groupService.findAllWithoutSubGroups(user);
  }

  @Get("findAllWithoutCandidates/:user")
  public findAllWithoutCandidates(
    @Param("user", ParseObjectIdPipe) user: string,
  ): Promise<Group[]> {
    return this.groupService.findAllWithoutCandidates(user);
  }

  @Get("findAllWithCandidates/:user")
  public findAllWithCandidates(
    @Param("user", ParseObjectIdPipe) user: string,
  ): Promise<Group[]> {
    return this.groupService.findAllWithCandidates(user);
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

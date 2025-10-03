import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import type { IGroupRepository } from "./repositories/group.repository";
import { UserService } from "../user/user.service";
import { Group } from "./entities/group.entity";
import { Message } from "../../shared/interfaces/messages";
import { FindGroupDto } from "./dto/find-group.dto";

@Injectable()
export class GroupService {
  public constructor(
    @Inject("IGroupRepository")
    private readonly groupRepository: IGroupRepository,
    private readonly userService: UserService,
  ) {}

  public async create(createGroupDto: CreateGroupDto): Promise<Message> {
    await this.userService.findById(createGroupDto.user);
    if (createGroupDto.group) await this.findById(createGroupDto.group);
    await this.groupRepository.create(createGroupDto);
    return { message: "Grupo criado com sucesso" };
  }

  public async findById(id: string): Promise<Group> {
    const group = await this.groupRepository.findById(id);
    if (!group) throw new NotFoundException("Grupo não encontrado");
    return group;
  }

  public findMany(user: string, findGroupDto: FindGroupDto): Promise<Group[]> {
    return this.groupRepository.findMany(user, findGroupDto);
  }

  public async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<Message> {
    const { group } = await this.findById(id);

    if (updateGroupDto.user) delete updateGroupDto.user;

    if (updateGroupDto.group && group && updateGroupDto.group != group.id)
      await this.findById(updateGroupDto.group);

    await this.groupRepository.update(id, updateGroupDto);
    return { message: "Grupo atualizado com sucesso" };
  }

  public async delete(id: string): Promise<Message> {
    await this.findById(id);
    await this.groupRepository.delete(id);
    return { message: "Grupo deletado com sucesso" };
  }
}

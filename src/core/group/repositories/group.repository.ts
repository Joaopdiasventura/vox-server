import { CreateGroupDto } from "../dto/create-group.dto";
import { FindGroupDto } from "../dto/find-group.dto";
import { UpdateGroupDto } from "../dto/update-group.dto";
import { Group } from "../entities/group.entity";

export interface IGroupRepository {
  create(createGroupDto: CreateGroupDto): Promise<Group>;
  findById(id: string): Promise<Group | null>;
  findMany(user: string, findGroupDto: FindGroupDto): Promise<Group[]>;
  update(id: string, UpdateGroupDto: UpdateGroupDto): Promise<void>;
  delete(id: string): Promise<void>;
}

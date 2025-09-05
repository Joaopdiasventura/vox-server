import { CreateGroupDto } from "../dto/create-group.dto";
import { UpdateGroupDto } from "../dto/update-group.dto";
import { Group } from "../entities/group.entity";

export interface IGroupRepository {
  create(createGroupDto: CreateGroupDto): Promise<Group>;
  findById(id: string): Promise<Group | null>;
  findManyByUser(user: string, name: string): Promise<Group[]>;
  findManyByGroup(group: string, name: string): Promise<Group[]>;
  findAllWithoutSubGroups(user: string): Promise<Group[]>;
  findAllWithoutCandidates(user: string): Promise<Group[]>;
  findAllWithCandidates(user: string): Promise<Group[]>;
  update(id: string, UpdateGroupDto: UpdateGroupDto): Promise<void>;
  delete(id: string): Promise<void>;
}

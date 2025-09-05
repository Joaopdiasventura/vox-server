import { InjectModel } from "@nestjs/mongoose";
import { CreateGroupDto } from "../dto/create-group.dto";
import { UpdateGroupDto } from "../dto/update-group.dto";
import { Group } from "../entities/group.entity";
import { IGroupRepository } from "./group.repository";
import { Model } from "mongoose";

export class MongoGroupRepository implements IGroupRepository {
  private readonly pageSize = 10;

  public constructor(
    @InjectModel("Group") private readonly groupModel: Model<Group>,
  ) {}

  public create(createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupModel.insertOne(createGroupDto);
  }

  public findById(id: string): Promise<Group | null> {
    return this.groupModel.findById(id).exec();
  }

  public findManyByUser(user: string, name: string): Promise<Group[]> {
    return this.groupModel
      .find({ user, $gt: name })
      .sort({ name: 1, _id: 1 })
      .limit(this.pageSize)
      .exec();
  }

  public findManyByGroup(group: string, name: string): Promise<Group[]> {
    return this.groupModel
      .find({ group, $gt: name })
      .sort({ name: 1, _id: 1 })
      .limit(this.pageSize)
      .exec();
  }

  public findAllWithoutSubGroups(user: string): Promise<Group[]> {
    return this.groupModel
      .aggregate<Group>([
        {
          $match: { user },
        },
        {
          $addFields: { idString: { $toString: "$_id" } },
        },
        {
          $lookup: {
            from: "groups",
            localField: "idString",
            foreignField: "group",
            as: "subGroups",
          },
        },
        {
          $match: { "subGroups.0": { $exists: false } },
        },
        {
          $project: {
            subGroups: 0,
            idString: 0,
          },
        },
        {
          $lookup: {
            from: "groups",
            let: { parentId: "$group" },
            pipeline: [
              { $addFields: { idString: { $toString: "$_id" } } },
              { $match: { $expr: { $eq: ["$idString", "$$parentId"] } } },
              { $project: { name: 1 } },
            ],
            as: "parentGroup",
          },
        },
        {
          $addFields: {
            isSubgroup: { $cond: [{ $ifNull: ["$group", false] }, 1, 0] },
            group: {
              $cond: {
                if: { $ifNull: ["$group", false] },
                then: { $arrayElemAt: ["$parentGroup.name", 0] },
                else: "$group",
              },
            },
          },
        },
        {
          $sort: { group: 1, isSubgroup: 1, name: 1 },
        },
        {
          $project: { parentGroup: 0, isSubgroup: 0 },
        },
      ])
      .exec();
  }

  public findAllWithoutCandidates(user: string): Promise<Group[]> {
    return this.findAllBasedOnCandidates(user, true);
  }

  public findAllWithCandidates(user: string): Promise<Group[]> {
    return this.findAllBasedOnCandidates(user, false);
  }

  public async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<void> {
    await this.groupModel.findByIdAndUpdate(id, updateGroupDto).exec();
  }

  public async delete(id: string): Promise<void> {
    await this.groupModel.findByIdAndDelete(id).exec();
  }

  private findAllBasedOnCandidates(
    user: string,
    without: boolean,
  ): Promise<Group[]> {
    return this.groupModel
      .aggregate<Group>([
        { $match: { user } },
        { $addFields: { idString: { $toString: "$_id" } } },
        {
          $lookup: {
            from: "candidates",
            localField: "idString",
            foreignField: "group",
            as: "candidates",
          },
        },
        { $match: { "candidates.0": { $exists: without } } },
        { $project: { candidates: 0, idString: 0 } },
        {
          $lookup: {
            from: "groups",
            let: { parentId: "$group" },
            pipeline: [
              { $addFields: { idString: { $toString: "$_id" } } },
              { $match: { $expr: { $eq: ["$idString", "$$parentId"] } } },
              { $project: { name: 1 } },
            ],
            as: "parentGroup",
          },
        },
        {
          $addFields: {
            isSubgroup: { $cond: [{ $ifNull: ["$group", false] }, 1, 0] },
            group: {
              $cond: {
                if: { $ifNull: ["$group", false] },
                then: { $arrayElemAt: ["$parentGroup.name", 0] },
                else: "$group",
              },
            },
          },
        },
        {
          $sort: { group: 1, isSubgroup: 1, name: 1 },
        },
        {
          $project: { parentGroup: 0, isSubgroup: 0 },
        },
      ])
      .exec();
  }
}

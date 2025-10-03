import { InjectModel } from "@nestjs/mongoose";
import { CreateGroupDto } from "../dto/create-group.dto";
import { UpdateGroupDto } from "../dto/update-group.dto";
import { Group } from "../entities/group.entity";
import { IGroupRepository } from "./group.repository";
import { Model, PipelineStage } from "mongoose";
import { FindGroupDto } from "../dto/find-group.dto";

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

  public async findMany(
    user: string,
    { page, limit, orderBy, withSubGroups, withCandidates }: FindGroupDto,
  ): Promise<Group[]> {
    const pipeline: PipelineStage[] = [
      { $match: { user: `${user}` } },
      { $addFields: { idString: { $toString: "$_id" } } },
    ];

    if (withSubGroups != undefined) {
      pipeline.push(
        {
          $lookup: {
            from: "groups",
            localField: "idString",
            foreignField: "group",
            as: "subGroups",
          },
        },
        {
          $match: {
            "subGroups.0": { $exists: !withSubGroups },
          },
        },
        { $project: { subGroups: 0 } },
      );
    }

    if (withCandidates != undefined)
      pipeline.push(
        {
          $lookup: {
            from: "candidates",
            localField: "idString",
            foreignField: "group",
            as: "candidates",
          },
        },
        {
          $match: {
            "candidates.0": { $exists: !!withCandidates },
          },
        },
        { $project: { candidates: 0 } },
      );

    pipeline.push({
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
    });

    pipeline.push({
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
    });

    if (orderBy) {
      const [field, direction] = orderBy.split(":");
      if (field && direction)
        pipeline.push({
          $sort: {
            [field]: direction == "desc" ? -1 : 1,
            _id: 1,
          },
        });
    } else pipeline.push({ $sort: { group: 1, isSubgroup: 1, name: 1 } });

    if (limit && limit > 0) {
      if (page && page >= 0) pipeline.push({ $skip: page * limit });
      pipeline.push({ $limit: limit });
    }

    pipeline.push({ $project: { parentGroup: 0, isSubgroup: 0, idString: 0 } });

    return this.groupModel.aggregate<Group>(pipeline).exec();
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
}

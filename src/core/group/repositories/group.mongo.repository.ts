import { InjectModel } from "@nestjs/mongoose";
import { CreateGroupDto } from "../dto/create-group.dto";
import { UpdateGroupDto } from "../dto/update-group.dto";
import { Group } from "../entities/group.entity";
import { GroupRepository } from "./group.repository";
import { Model } from "mongoose";
import { VoteResult } from "../../../shared/interfaces/vote-result";

export class MongoGroupRepository implements GroupRepository {
  public constructor(
    @InjectModel("Group") private readonly groupModel: Model<Group>,
  ) {}

  public async create(createGroupDto: CreateGroupDto): Promise<Group> {
    return await this.groupModel.create(createGroupDto);
  }

  public async findById(id: string): Promise<Group> {
    return await this.groupModel.findById(id).exec();
  }

  public async findManyByUser(user: string, page: number): Promise<Group[]> {
    const pageSize = 10;
    return this.groupModel
      .find({
        user,
        $or: [{ group: { $exists: false } }, { group: null }],
      })
      .select("-user")
      .skip(page * pageSize)
      .limit(pageSize)
      .sort({ name: 1 })
      .exec();
  }

  public async findManyByGroup(group: string, page: number): Promise<Group[]> {
    return await this.groupModel
      .find({ group })
      .select("-group -user")
      .skip(10 * page)
      .limit(10)
      .sort({ name: 1 })
      .exec();
  }

  public async findAllWithoutSubGroups(user: string): Promise<Group[]> {
    return await this.groupModel
      .aggregate<Group>([
        {
          $match: { user: user },
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

  public async findAllWithoutParticipants(user: string): Promise<Group[]> {
    return await this.groupModel
      .aggregate<Group>([
        { $match: { user: user } },
        { $addFields: { idString: { $toString: "$_id" } } },
        {
          $lookup: {
            from: "participants",
            localField: "idString",
            foreignField: "group",
            as: "participants",
          },
        },
        { $match: { "participants.0": { $exists: false } } },
        { $project: { participants: 0, idString: 0 } },
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

  public async findAllWithParticipants(user: string): Promise<Group[]> {
    return await this.groupModel
      .aggregate<Group>([
        { $match: { user: user } },
        { $addFields: { idString: { $toString: "$_id" } } },
        {
          $lookup: {
            from: "participants",
            localField: "idString",
            foreignField: "group",
            as: "participants",
          },
        },
        { $match: { "participants.0": { $exists: true } } },
        { $project: { participants: 0, idString: 0 } },
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

  public async getResult(group: string): Promise<VoteResult> {
    return (
      await this.groupModel.aggregate<VoteResult>([
        {
          $addFields: {
            groupObjectId: { $toObjectId: group },
          },
        },
        {
          $lookup: {
            from: "groups",
            localField: "groupObjectId",
            foreignField: "_id",
            as: "group",
            pipeline: [{ $project: { name: 1 } }],
          },
        },
        { $unwind: "$group" },
        {
          $lookup: {
            from: "participants",
            let: {
              gIdString: { $toString: "$group._id" },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$group", "$$gIdString"],
                  },
                },
              },
              { $project: { name: 1, group: 1 } },
            ],
            as: "participant",
          },
        },
        { $unwind: "$participant" },
        {
          $lookup: {
            from: "votes",
            let: {
              pIdString: { $toString: "$participant._id" },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$participant", "$$pIdString"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                },
              },
            ],
            as: "votes",
          },
        },
        {
          $addFields: {
            votesCount: { $size: "$votes" },
          },
        },
        {
          $group: {
            _id: "$participant._id",
            group: { $first: "$group" },
            name: { $first: "$participant.name" },
            votes: { $first: "$votesCount" },
          },
        },
        {
          $group: {
            _id: "$group",
            participants: {
              $push: {
                _id: "$_id",
                name: "$name",
                votes: "$votes",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            group: "$_id",
            participants: {
              $sortArray: {
                input: "$participants",
                sortBy: { votes: -1, name: 1 },
              },
            },
          },
        },
      ])
    )[0];
  }

  public async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return await this.groupModel.findByIdAndUpdate(id, updateGroupDto).exec();
  }

  public async delete(id: string): Promise<Group> {
    return await this.groupModel.findByIdAndDelete(id).exec();
  }
}

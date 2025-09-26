import { InjectModel } from "@nestjs/mongoose";
import { CreatePoolDto } from "../dto/create-pool.dto";
import { Pool } from "../entities/pool.entity";
import { IPoolRepository } from "./pool.repository";
import { Model, PipelineStage } from "mongoose";
import { UpdatePoolDto } from "../dto/update-pool.dto";
import { FindPoolDto } from "../dto/find-pool.dto";

export class MongoPoolRepository implements IPoolRepository {
  public constructor(
    @InjectModel("Pool") private readonly poolModel: Model<Pool>,
  ) {}

  public create(createPoolDto: CreatePoolDto): Promise<Pool> {
    return this.poolModel.insertOne(createPoolDto) as unknown as Promise<Pool>;
  }

  public findById(id: string): Promise<Pool | null> {
    return this.poolModel.findById(id).exec();
  }

  public findMany(
    user: string,
    { page, limit, orderBy, group }: FindPoolDto,
  ): Promise<Pool[]> {
    const pipeline: PipelineStage[] = [
      {
        $addFields: { groupObjId: { $toObjectId: "$group" } },
      },
      {
        $lookup: {
          from: "groups",
          localField: "groupObjId",
          foreignField: "_id",
          as: "group",
        },
      },
      { $unwind: "$group" },
      { $match: { "group.user": `${user}` } },
    ];

    if (group) pipeline.push({ $match: { group } });

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
      pipeline.push({ $limit: limit });
      if (page && page >= 0) pipeline.push({ $skip: page * limit });
    }

    pipeline.push({ $project: { groupObjId: 0 } });

    return this.poolModel.aggregate<Pool>(pipeline).exec();
  }

  public async update(id: string, updatePoolDto: UpdatePoolDto): Promise<void> {
    await this.poolModel.findByIdAndUpdate(id, updatePoolDto).exec();
  }

  public async delete(id: string): Promise<void> {
    await this.poolModel.findByIdAndDelete(id).exec();
  }
}

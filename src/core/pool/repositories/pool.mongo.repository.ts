import { InjectModel } from "@nestjs/mongoose";
import { CreatePoolDto } from "../dto/create-pool.dto";
import { Pool } from "../entities/pool.entity";
import { IPoolRepository } from "./pool.repository";
import { Model } from "mongoose";
import { UpdatePoolDto } from "../dto/update-pool.dto";

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

  public findAllByUser(user: string): Promise<Pool[]> {
    return this.poolModel
      .aggregate<Pool>([
        {
          $addFields: {
            groupObjId: {
              $convert: {
                input: "$group",
                to: "objectId",
              },
            },
          },
        },
        {
          $lookup: {
            from: "groups",
            let: { gid: "$groupObjId", u: user },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$gid"] },
                      { $eq: ["$user", "$$u"] },
                    ],
                  },
                },
              },
            ],
            as: "group",
          },
        },
        { $unwind: "$group" },
        { $project: { groupObjId: 0 } },
      ])
      .exec();
  }

  public async update(id: string, updatePoolDto: UpdatePoolDto): Promise<void> {
    await this.poolModel.findByIdAndUpdate(id, updatePoolDto).exec();
  }

  public async delete(id: string): Promise<void> {
    await this.poolModel.findByIdAndDelete(id).exec();
  }
}

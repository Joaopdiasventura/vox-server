import { InjectModel } from "@nestjs/mongoose";
import { CreateVoteDto } from "../dto/create-vote.dto";
import { Vote } from "../entities/vote.entity";
import { Result } from "../interfaces/result";
import { IVoteRepository } from "./vote.repository";
import { Model } from "mongoose";

export class MongoVoteRepository implements IVoteRepository {
  public constructor(
    @InjectModel("Vote") private readonly voteModel: Model<Vote>,
  ) {}

  public create(createVoteDto: CreateVoteDto): Promise<Vote> {
    return this.voteModel.insertOne(createVoteDto);
  }

  public findResult(pool: string): Promise<Result[]> {
    return this.voteModel
      .aggregate<Result>([
        { $match: { pool } },
        { $group: { _id: "$candidate", quantity: { $sum: 1 } } },
        {
          $lookup: {
            from: "candidates",
            localField: "_id",
            foreignField: "_id",
            as: "candidate",
          },
        },
        { $unwind: { path: "$candidate", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, candidate: 1, quantity: 1 } },
        { $sort: { quantity: -1, "candidate.name": 1 } },
      ])
      .exec();
  }
}

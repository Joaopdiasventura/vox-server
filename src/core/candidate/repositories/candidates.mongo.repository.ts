import { InjectModel } from "@nestjs/mongoose";
import { CreateCandidateDto } from "../dto/create-candidate.dto";
import { UpdateCandidateDto } from "../dto/update-candidate.dto";
import { Candidate } from "../entities/candidate.entity";
import { ICandidateRepository } from "./candidates.repository";
import { Model, PipelineStage } from "mongoose";
import { FindCandidateDto } from "../dto/find-candidate.dto";

export class MongoCandidateRepository implements ICandidateRepository {
  private readonly pageSize = 10;

  public constructor(
    @InjectModel("Candidate") private readonly candidateModel: Model<Candidate>,
  ) {}

  public create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    return this.candidateModel.insertOne(createCandidateDto);
  }

  public findById(id: string): Promise<Candidate | null> {
    return this.candidateModel.findById(id).exec();
  }

  public findMany(
    group: string,
    { page, limit, orderBy }: FindCandidateDto,
  ): Promise<Candidate[]> {
    const pipeline: PipelineStage[] = [{ $match: { group } }];

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

    pipeline.push({ $project: { groupObjId: 0 } });

    return this.candidateModel.aggregate<Candidate>(pipeline).exec();
  }

  public async update(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
  ): Promise<void> {
    await this.candidateModel.findByIdAndUpdate(id, updateCandidateDto).exec();
  }

  public async delete(id: string): Promise<void> {
    await this.candidateModel.findByIdAndDelete(id).exec();
  }
}

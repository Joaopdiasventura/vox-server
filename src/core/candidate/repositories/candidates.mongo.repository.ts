import { InjectModel } from "@nestjs/mongoose";
import { CreateCandidateDto } from "../dto/create-candidate.dto";
import { UpdateCandidateDto } from "../dto/update-candidate.dto";
import { Candidate } from "../entities/candidate.entity";
import { ICandidateRepository } from "./candidates.repository";
import { Model } from "mongoose";

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

  public findManyByGroup(group: string, name: string): Promise<Candidate[]> {
    return this.candidateModel
      .find({ group, $gt: name })
      .sort({ name: 1, _id: 1 })
      .limit(this.pageSize)
      .exec();
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

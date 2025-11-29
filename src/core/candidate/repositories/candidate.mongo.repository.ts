import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { FindCandidateDto } from '../dto/find-candidate.dto';
import { UpdateCandidateDto } from '../dto/update-candidate.dto';
import { Candidate } from '../entities/candidate.entity';
import { ICandidateRepository } from './candidate.repository';

export class MongoCandidateRepository implements ICandidateRepository {
  public constructor(
    @InjectModel('Candidate') private readonly candidateModel: Model<Candidate>,
  ) {}

  public create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    return this.candidateModel.insertOne(createCandidateDto);
  }

  public findById(id: string): Promise<Candidate | null> {
    return this.candidateModel
      .findById(id)
      .populate({ path: 'election', select: 'name user' })
      .exec();
  }

  public findMany(
    user: string,
    findCandidateDto: FindCandidateDto,
  ): Promise<Candidate[]> {
    const pipeline: PipelineStage[] = [
      { $addFields: { objectId: { $toObjectId: '$election' } } },
    ];

    const baseMatch: Record<string, unknown> = {};
    if (findCandidateDto.name)
      baseMatch.name = { $regex: findCandidateDto.name.trim(), $options: 'i' };
    if (findCandidateDto.election)
      baseMatch.election = findCandidateDto.election;
    else
      pipeline.push(
        {
          $lookup: {
            from: 'elections',
            localField: 'objectId',
            foreignField: '_id',
            as: 'election',
            pipeline: [{ $project: { _id: 0, name: 1, user: 1 } }],
          },
        },
        { $unwind: '$election' },
        { $match: { 'election.user': user } },
        { $project: { objectId: 0 } },
      );
    if (Object.keys(baseMatch).length) pipeline.unshift({ $match: baseMatch });

    if (findCandidateDto.orderBy) {
      const [field, direction] = findCandidateDto.orderBy.split(':');
      if (field && direction)
        pipeline.push({
          $sort: {
            [field]: direction == 'desc' ? -1 : 1,
          },
        });
    } else pipeline.push({ $sort: { group: 1, isSubgroup: 1, name: 1 } });

    if (findCandidateDto.limit && findCandidateDto.limit > 0) {
      if (findCandidateDto.page && findCandidateDto.page >= 0)
        pipeline.push({
          $skip: findCandidateDto.page * findCandidateDto.limit,
        });
      pipeline.push({ $limit: findCandidateDto.limit });
    }
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

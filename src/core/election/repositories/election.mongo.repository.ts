import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { IElectionRepository } from './election.repository';
import { CreateElectionDto } from '../dto/create-election.dto';
import { FindElectionDto } from '../dto/find-election.dto';
import { UpdateElectionDto } from '../dto/update-election.dto';
import { Election } from '../entities/election.entity';

export class MongoElectionRepository implements IElectionRepository {
  public constructor(
    @InjectModel('Election') private readonly electionModel: Model<Election>,
  ) {}

  public create(createElectionDto: CreateElectionDto): Promise<Election> {
    return this.electionModel.insertOne(createElectionDto);
  }

  public findById(id: string): Promise<Election | null> {
    return this.electionModel.findById(id).exec();
  }

  public findMany(
    user: string,
    findElectionDto: FindElectionDto,
  ): Promise<Election[]> {
    const pipeline: PipelineStage[] = [{ $match: { user: user } }];

    if (findElectionDto.name)
      pipeline.push({
        $match: {
          name: { $regex: findElectionDto.name.trim(), $options: 'i' },
        },
      });

    if (findElectionDto.orderBy) {
      const [field, direction] = findElectionDto.orderBy.split(':');
      if (field && direction)
        pipeline.push({
          $sort: {
            [field]: direction == 'desc' ? -1 : 1,
          },
        });
    } else pipeline.push({ $sort: { group: 1, isSubgroup: 1, name: 1 } });

    if (findElectionDto.limit && findElectionDto.limit > 0) {
      if (findElectionDto.page && findElectionDto.page >= 0)
        pipeline.push({ $skip: findElectionDto.page * findElectionDto.limit });
      pipeline.push({ $limit: findElectionDto.limit });
    }

    return this.electionModel.aggregate<Election>(pipeline).exec();
  }

  public async update(
    id: string,
    updateElectionDto: UpdateElectionDto,
  ): Promise<void> {
    await this.electionModel.findByIdAndUpdate(id, updateElectionDto).exec();
  }

  public async delete(id: string): Promise<void> {
    await this.electionModel.findByIdAndDelete(id).exec();
  }
}

import { InjectModel } from '@nestjs/mongoose';
import { CreateSessionDto } from '../dto/create-session.dto';
import { FindSessionDto } from '../dto/find-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { Session } from '../entities/session.entity';
import { ISessionRepository } from './session.repository';
import { Model, PipelineStage } from 'mongoose';

export class MongoSessionRepository implements ISessionRepository {
  public constructor(
    @InjectModel('Session') private readonly sessionModel: Model<Session>,
  ) {}

  public create(createSessionDto: CreateSessionDto): Promise<Session> {
    return this.sessionModel.insertOne(createSessionDto);
  }

  public findById(id: string): Promise<Session | null> {
    return this.sessionModel
      .findById(id)
      .populate({ path: 'elections', select: 'name user' })
      .exec();
  }

  public findMany(
    user: string,
    findSessionDto: FindSessionDto,
  ): Promise<Session[]> {
    const pipeline: PipelineStage[] = [
      { $match: { $expr: { $gt: [{ $size: '$elections' }, 0] } } },
      {
        $addFields: {
          electionObjectIds: {
            $map: {
              input: '$elections',
              as: 'id',
              in: { $toObjectId: '$$id' },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'elections',
          let: { ids: '$electionObjectIds' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$ids'] } } },
            { $project: { _id: 1, name: 1, user: 1 } },
          ],
          as: 'elections',
        },
      },
      {
        $match: {
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$elections',
                    as: 'e',
                    cond: { $eq: ['$$e.user', user] },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      { $project: { electionObjectIds: 0, 'elections.user': 0 } },
    ];

    const baseMatch: Record<string, unknown> = {};
    if (findSessionDto.name)
      baseMatch.name = { $regex: findSessionDto.name.trim(), $options: 'i' };
    if (findSessionDto.election) baseMatch.elections = findSessionDto.election;
    if (Object.keys(baseMatch).length) pipeline.unshift({ $match: baseMatch });

    if (findSessionDto.orderBy) {
      const [field, direction] = findSessionDto.orderBy.split(':');
      if (field && direction)
        pipeline.push({
          $sort: {
            [field]: direction == 'desc' ? -1 : 1,
          },
        });
    } else pipeline.push({ $sort: { group: 1, isSubgroup: 1, name: 1 } });

    if (findSessionDto.limit && findSessionDto.limit > 0) {
      if (findSessionDto.page && findSessionDto.page >= 0)
        pipeline.push({
          $skip: findSessionDto.page * findSessionDto.limit,
        });
      pipeline.push({ $limit: findSessionDto.limit });
    }
    return this.sessionModel.aggregate<Session>(pipeline).exec();
  }

  public async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<void> {
    await this.sessionModel.findByIdAndUpdate(id, updateSessionDto).exec();
  }

  public async addVote(id: string): Promise<void> {
    await this.sessionModel
      .findByIdAndUpdate(id, {
        $inc: { votes: 1 },
      })
      .exec();
  }

  public async delete(id: string): Promise<void> {
    await this.sessionModel.findByIdAndDelete(id).exec();
  }
}

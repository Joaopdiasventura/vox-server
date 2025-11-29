import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IVoteRepository } from './vote.repository';
import { CreateVoteDto } from '../dto/create-vote.dto';
import { Vote } from '../entities/vote.entity';
import { VoteResult } from '../interfaces/vote-result';
import { Candidate } from '../../candidate/entities/candidate.entity';

export class MongoVoteRepository implements IVoteRepository {
  public constructor(
    @InjectModel('Vote') private readonly voteModel: Model<Vote>,
  ) {}

  public create(createVoteDto: CreateVoteDto): Promise<Vote> {
    return this.voteModel.insertOne(createVoteDto);
  }

  public async findResult(session: string): Promise<VoteResult[]> {
    const votes = await this.voteModel
      .find({ session })
      .populate({
        path: 'candidate',
        select: 'name election',
      })
      .exec();

    const quantities = new Map<
      string,
      { election: string; candidate: Candidate | null; quantity: number }
    >();

    for (const vote of votes) {
      const candidate = vote.candidate as Candidate | null;
      const election = vote.election as unknown as string;
      const candidateId = candidate ? String(candidate._id) : 'null';
      const key = `${election}:${candidateId}`;

      const existing = quantities.get(key);

      if (existing) {
        existing.quantity += 1;
      } else {
        quantities.set(key, {
          election,
          candidate,
          quantity: 1,
        });
      }
    }

    return Array.from(quantities.values());
  }
}

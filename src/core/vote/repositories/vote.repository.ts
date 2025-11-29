import { CreateVoteDto } from '../dto/create-vote.dto';
import { Vote } from '../entities/vote.entity';
import { VoteResult } from '../interfaces/vote-result';

export abstract class IVoteRepository {
  public abstract create(createVoteDto: CreateVoteDto): Promise<Vote>;
  public abstract findResult(session: string): Promise<VoteResult[]>;
}

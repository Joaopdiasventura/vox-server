import { CreateVoteDto } from "../dto/create-vote.dto";
import { Vote } from "../entities/vote.entity";
import { Result } from "../interfaces/result";

export interface IVoteRepository {
  create(createVoteDto: CreateVoteDto): Promise<Vote>;
  findResult(pool: string): Promise<Result[]>;
}

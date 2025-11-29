import { Candidate } from '../../candidate/entities/candidate.entity';

export interface VoteResult {
  election: string;
  quantity: number;
  candidate: Candidate | null;
}

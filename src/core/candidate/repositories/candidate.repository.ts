import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { FindCandidateDto } from '../dto/find-candidate.dto';
import { UpdateCandidateDto } from '../dto/update-candidate.dto';
import { Candidate } from '../entities/candidate.entity';

export abstract class ICandidateRepository {
  public abstract create(
    createCandidateDto: CreateCandidateDto,
  ): Promise<Candidate>;
  public abstract findById(id: string): Promise<Candidate | null>;
  public abstract findMany(
    user: string,
    findCandidateDto: FindCandidateDto,
  ): Promise<Candidate[]>;
  public abstract update(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
  ): Promise<void>;
  public abstract delete(id: string): Promise<void>;
}

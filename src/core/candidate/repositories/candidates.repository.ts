import { CreateCandidateDto } from "../dto/create-candidate.dto";
import { UpdateCandidateDto } from "../dto/update-candidate.dto";
import { Candidate } from "../entities/candidate.entity";

export interface ICandidateRepository {
  create(createCandidateDto: CreateCandidateDto): Promise<Candidate>;
  findById(id: string): Promise<Candidate | null>;
  findManyByGroup(group: string, name: string): Promise<Candidate[]>;
  update(id: string, updateCandidateDto: UpdateCandidateDto): Promise<void>;
  delete(id: string): Promise<void>;
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { FindCandidateDto } from './dto/find-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ICandidateRepository } from './repositories/candidate.repository';
import { Candidate } from './entities/candidate.entity';
import { Message } from '../../shared/interfaces/messages';
import { ElectionService } from '../election/election.service';

@Injectable()
export class CandidateService {
  public constructor(
    private readonly candidateRepository: ICandidateRepository,
    private readonly electionService: ElectionService,
  ) {}

  public async create(
    createCandidateDto: CreateCandidateDto,
  ): Promise<Message> {
    await this.electionService.findById(createCandidateDto.election);
    await this.candidateRepository.create(createCandidateDto);
    return { message: 'Candidato adicionado com sucesso' };
  }

  public async findById(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findById(id);
    if (!candidate) throw new NotFoundException('Candidato não encontrado');
    return candidate;
  }

  public findMany(
    user: string,
    findCandidateDto: FindCandidateDto,
  ): Promise<Candidate[]> {
    return this.candidateRepository.findMany(user, findCandidateDto);
  }

  public async update(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
  ): Promise<Message> {
    const { election } = await this.findById(id);
    if (
      updateCandidateDto.election &&
      updateCandidateDto.election != election.id
    )
      await this.electionService.findById(updateCandidateDto.election);

    await this.candidateRepository.update(id, updateCandidateDto);
    return { message: 'Candidato atualizado com sucesso' };
  }

  public async delete(id: string): Promise<Message> {
    await this.findById(id);
    await this.candidateRepository.delete(id);
    return { message: 'Candidato removido com sucesso' };
  }
}

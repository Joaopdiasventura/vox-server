import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { GroupService } from "../group/group.service";
import { Message } from "src/shared/interfaces/messages";
import { Candidate } from "./entities/candidate.entity";
import type { ICandidateRepository } from "./repositories/candidates.repository";
import { FindCandidateDto } from "./dto/find-candidate.dto";

@Injectable()
export class CandidateService {
  public constructor(
    @Inject("ICandidateRepository")
    private readonly candidateRepository: ICandidateRepository,
    private readonly groupService: GroupService,
  ) {}

  public async create(
    createCandidateDto: CreateCandidateDto,
  ): Promise<Message> {
    await this.groupService.findById(createCandidateDto.group);
    await this.candidateRepository.create(createCandidateDto);
    return { message: "Candidato adicionado com sucesso" };
  }

  public async findById(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findById(id);
    if (!candidate) throw new NotFoundException("Candidato não encontrado");
    return candidate;
  }

  public findMany(
    group: string,
    findCandidateDto: FindCandidateDto,
  ): Promise<Candidate[]> {
    return this.candidateRepository.findMany(group, findCandidateDto);
  }

  public async update(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
  ): Promise<Message> {
    await this.findById(id);
    await this.candidateRepository.update(id, updateCandidateDto);
    return { message: "Candidato atualizado com sucesso" };
  }

  public async delete(id: string): Promise<Message> {
    await this.findById(id);
    await this.candidateRepository.delete(id);
    return { message: "Candidato atualizado com sucesso" };
  }
}

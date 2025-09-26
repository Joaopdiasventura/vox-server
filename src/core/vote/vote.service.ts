import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateVoteDto } from "./dto/create-vote.dto";
import { Message } from "../../shared/interfaces/messages";
import { PoolService } from "../pool/pool.service";
import { CandidateService } from "../candidate/candidate.service";
import { VoteGateway } from "./vote.gateway";
import { Result } from "./interfaces/result";
import type { IVoteRepository } from "./repositories/vote.repository";

@Injectable()
export class VoteService {
  public constructor(
    @Inject("IVoteRepository") private readonly voteRepository: IVoteRepository,
    private readonly voteGateway: VoteGateway,
    private readonly poolService: PoolService,
    private readonly candidateService: CandidateService,
  ) {}

  public async create(createVoteDto: CreateVoteDto): Promise<Message> {
    const { start, end } = await this.poolService.findById(createVoteDto.pool);
    const now = new Date();

    if (start >= now)
      throw new UnauthorizedException("A votação não foi iniciada");
    if (end <= now) throw new UnauthorizedException("A votação foi encerrada");

    if (createVoteDto.candidate)
      await this.candidateService.findById(createVoteDto.candidate);

    const vote = await this.voteRepository.create(createVoteDto);
    await this.poolService.updateVotes(createVoteDto.pool);
    this.voteGateway.sendVote(vote);
    return { message: "Voto realizado com sucesso" };
  }

  public findResult(pool: string): Promise<Result[]> {
    return this.voteRepository.findResult(pool);
  }
}

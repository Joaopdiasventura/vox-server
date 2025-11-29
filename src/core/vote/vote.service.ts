import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VoteResult } from './interfaces/vote-result';
import { IVoteRepository } from './repositories/vote.repository';
import { VoteGateway } from './vote.gateway';
import { Message } from '../../shared/interfaces/messages';
import { CandidateService } from '../candidate/candidate.service';
import { SessionService } from '../session/session.service';
import { UserService } from '../user/user.service';

@Injectable()
export class VoteService {
  public constructor(
    private readonly voteRepository: IVoteRepository,
    private readonly voteGateway: VoteGateway,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly candidateService: CandidateService,
  ) {}

  public async create(
    createVoteDto: CreateVoteDto,
    user: string,
  ): Promise<Message> {
    const session = await this.sessionService.findById(createVoteDto.session);

    if (new Date() > session.endedAt)
      throw new UnauthorizedException('Votação encerrada');

    const { votes } = await this.userService.findById(user);

    if (session.votes >= votes)
      throw new UnauthorizedException('Limite de votos atingido');

    if (createVoteDto.candidate)
      await this.candidateService.findById(createVoteDto.candidate);

    const result = await this.voteRepository.create(createVoteDto);
    await this.sessionService.addVote(createVoteDto.session);
    this.voteGateway.onVoteCreated(result);
    return { message: 'Voto adicionado com sucesso' };
  }

  public findResult(session: string): Promise<VoteResult[]> {
    return this.voteRepository.findResult(session);
  }
}

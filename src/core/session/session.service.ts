import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { FindSessionDto } from './dto/find-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ISessionRepository } from './repositories/session.repository';
import { Session } from './entities/session.entity';
import { Message } from '../../shared/interfaces/messages';
import { ElectionService } from '../election/election.service';

@Injectable()
export class SessionService {
  public constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly electionService: ElectionService,
  ) {}

  public async create(
    createSessionDto: CreateSessionDto,
    user: string,
  ): Promise<Message> {
    if (createSessionDto.startedAt > createSessionDto.endedAt)
      throw new BadRequestException(
        'Não é possivel a data de inicio ser depois que a data de encerramento',
      );

    const elections = await Promise.all(
      createSessionDto.elections.map((id) => this.electionService.findById(id)),
    );

    for (const election of elections)
      if (election.user != user)
        throw new BadRequestException('Essa eleição não pertence a você');

    await this.sessionRepository.create(createSessionDto);
    return { message: 'Sessãao criada com sucesso' };
  }

  public findMany(
    user: string,
    findSessionDto: FindSessionDto,
  ): Promise<Session[]> {
    return this.sessionRepository.findMany(user, findSessionDto);
  }

  public async findById(id: string): Promise<Session> {
    const session = await this.sessionRepository.findById(id);
    if (!session) throw new NotFoundException('Sessão não encontrada');
    return session;
  }

  public async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Message> {
    const { startedAt, endedAt } = await this.findById(id);
    if (new Date() > endedAt)
      throw new UnauthorizedException(
        'Não é possível atualizar uma sessão depois dela ser encerrada',
      );

    updateSessionDto.startedAt = updateSessionDto.startedAt || startedAt;
    updateSessionDto.endedAt = updateSessionDto.endedAt || endedAt;

    if (updateSessionDto.startedAt > updateSessionDto.endedAt)
      throw new BadRequestException(
        'Não é possivel a data de inicio ser depois que a data de encerramento',
      );
    await this.sessionRepository.update(id, updateSessionDto);
    return { message: 'Sessão atualizada com sucesso' };
  }

  public async addVote(id: string): Promise<void> {
    await this.sessionRepository.addVote(id);
  }

  public async delete(id: string): Promise<Message> {
    const { votes } = await this.findById(id);

    if (votes)
      throw new ForbiddenException(
        'Não é possível deletar uma sessão com votos',
      );

    await this.sessionRepository.delete(id);
    return { message: 'Sessão deletada com sucesso' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateElectionDto } from './dto/create-election.dto';
import { FindElectionDto } from './dto/find-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { Election } from './entities/election.entity';
import { IElectionRepository } from './repositories/election.repository';
import { Message } from '../../shared/interfaces/messages';
import { UserService } from '../user/user.service';

@Injectable()
export class ElectionService {
  public constructor(
    private readonly electionRepository: IElectionRepository,
    private readonly userService: UserService,
  ) {}

  public async create(createElectionDto: CreateElectionDto): Promise<Message> {
    await this.userService.findById(createElectionDto.user);
    await this.electionRepository.create(createElectionDto);
    return { message: 'Eleição criada com sucesso' };
  }

  public async findById(id: string): Promise<Election> {
    const election = await this.electionRepository.findById(id);
    if (!election) throw new NotFoundException('Eleição não encontrada');
    return election;
  }

  public findMany(
    user: string,
    findElectionDto: FindElectionDto,
  ): Promise<Election[]> {
    return this.electionRepository.findMany(user, findElectionDto);
  }

  public async update(
    id: string,
    updateElectionDto: UpdateElectionDto,
  ): Promise<Message> {
    await this.findById(id);
    await this.electionRepository.update(id, updateElectionDto);
    return { message: 'Eleição atualizada com sucesso' };
  }

  public async delete(id: string): Promise<Message> {
    await this.findById(id);
    await this.electionRepository.delete(id);
    return { message: 'Eleição removida com sucesso' };
  }
}

import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePoolDto } from "./dto/create-pool.dto";
import { UpdatePoolDto } from "./dto/update-pool.dto";
import { GroupService } from "../group/group.service";
import type { IPoolRepository } from "./repositories/pool.repository";
import { Message } from "../../shared/interfaces/messages";
import { Pool } from "./entities/pool.entity";

@Injectable()
export class PoolService {
  public constructor(
    @Inject("IPoolRepository") private readonly poolRepository: IPoolRepository,
    private readonly groupService: GroupService,
  ) {}

  public async create(createPoolDto: CreatePoolDto): Promise<Message> {
    if (createPoolDto.start >= createPoolDto.end)
      throw new BadRequestException(
        "A data de inicio não pode ser igual ou maior que a de fim",
      );
    await this.groupService.findById(createPoolDto.group);
    await this.poolRepository.create(createPoolDto);
    return { message: "Votação criada com sucesso" };
  }

  public async findById(id: string): Promise<Pool> {
    const pool = await this.poolRepository.findById(id);
    if (!pool) throw new NotFoundException("Votação não encontrada");
    return pool;
  }

  public findAllByUser(user: string): Promise<Pool[]> {
    return this.poolRepository.findAllByUser(user);
  }

  public async update(
    id: string,
    { start, end }: UpdatePoolDto,
  ): Promise<Message> {
    await this.findById(id);
    if (start && end && start >= end)
      throw new BadRequestException(
        "A data de inicio não pode ser igual ou maior que a de fim",
      );
    await this.poolRepository.update(id, { start, end });
    return { message: "Votação atualizada com sucesso" };
  }

  public async delete(id: string): Promise<Message> {
    await this.findById(id);
    await this.poolRepository.delete(id);
    return { message: "Votação deletada com sucesso" };
  }
}

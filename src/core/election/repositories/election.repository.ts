import { CreateElectionDto } from '../dto/create-election.dto';
import { FindElectionDto } from '../dto/find-election.dto';
import { UpdateElectionDto } from '../dto/update-election.dto';
import { Election } from '../entities/election.entity';

export abstract class IElectionRepository {
  public abstract create(
    createElectionDto: CreateElectionDto,
  ): Promise<Election>;
  public abstract findById(id: string): Promise<Election | null>;
  public abstract findMany(
    user: string,
    findElectionDto: FindElectionDto,
  ): Promise<Election[]>;
  public abstract update(
    id: string,
    updateElectionDto: UpdateElectionDto,
  ): Promise<void>;
  public abstract delete(id: string): Promise<void>;
}

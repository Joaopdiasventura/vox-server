import { CreateSessionDto } from '../dto/create-session.dto';
import { FindSessionDto } from '../dto/find-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { Session } from '../entities/session.entity';

export abstract class ISessionRepository {
  public abstract create(createSessionDto: CreateSessionDto): Promise<Session>;
  public abstract findById(id: string): Promise<Session | null>;
  public abstract findMany(
    user: string,
    findSessionDto: FindSessionDto,
  ): Promise<Session[]>;
  public abstract update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<void>;
  public abstract addVote(id: string): Promise<void>;
  public abstract delete(id: string): Promise<void>;
}

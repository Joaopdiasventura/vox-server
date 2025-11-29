import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

export abstract class IUserRepository {
  public abstract create(createUserDto: CreateUserDto): Promise<User>;
  public abstract findById(id: string): Promise<User | null>;
  public abstract findByEmail(email: string): Promise<User | null>;
  public abstract findByTaxId(taxId: string): Promise<User | null>;
  public abstract update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<void>;
  public abstract delete(id: string): Promise<void>;
}

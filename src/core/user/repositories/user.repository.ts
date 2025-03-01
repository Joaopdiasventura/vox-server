import { UpdateUserDto } from "./../dto/update-user.dto";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "./../dto/create-user.dto";

export interface UserRepository {
  create(createUserDto: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<User>;
}

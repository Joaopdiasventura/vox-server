import { InjectModel } from "@nestjs/mongoose";
import { CreateUserDto } from "../dto/create-user.dto";
import { User } from "../entities/user.entity";
import { IUserRepository } from "./user.repository";
import { Model } from "mongoose";
import { UpdateUserDto } from "../dto/update-user.dto";

export class MongoUserRepository implements IUserRepository {
  public constructor(
    @InjectModel("User") private readonly userModel: Model<User>,
  ) {}

  public create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.insertOne(createUserDto);
  }

  public findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  public findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async update(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, updateUserDto).exec();
  }

  public async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}

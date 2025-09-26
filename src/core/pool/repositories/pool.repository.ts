import { CreatePoolDto } from "../dto/create-pool.dto";
import { FindPoolDto } from "../dto/find-pool.dto";
import { UpdatePoolDto } from "../dto/update-pool.dto";
import { Pool } from "../entities/pool.entity";

export interface IPoolRepository {
  create(createPoolDto: CreatePoolDto): Promise<Pool>;
  findById(id: string): Promise<Pool | null>;
  findMany(user: string, findPoolDto: FindPoolDto): Promise<Pool[]>;
  update(id: string, updatePoolDto: UpdatePoolDto): Promise<void>;
  delete(id: string): Promise<void>;
}

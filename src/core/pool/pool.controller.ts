import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { PoolService } from "./pool.service";
import { CreatePoolDto } from "./dto/create-pool.dto";
import { UpdatePoolDto } from "./dto/update-pool.dto";
import { Message } from "../../shared/interfaces/messages";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { Pool } from "./entities/pool.entity";

@Controller("pool")
export class PoolController {
  public constructor(private readonly poolService: PoolService) {}

  @Post()
  public create(@Body() createPoolDto: CreatePoolDto): Promise<Message> {
    return this.poolService.create(createPoolDto);
  }

  @Get(":id")
  public findById(@Param("id", ParseObjectIdPipe) id: string): Promise<Pool> {
    return this.poolService.findById(id);
  }

  @Get("findAllByUser/:user")
  public findAllByUser(
    @Param("user", ParseObjectIdPipe) user: string,
  ): Promise<Pool[]> {
    return this.poolService.findAllByUser(user);
  }

  @Patch(":id")
  public update(
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() updatePoolDto: UpdatePoolDto,
  ): Promise<Message> {
    return this.poolService.update(id, updatePoolDto);
  }

  @Delete(":id")
  public delete(@Param("id", ParseObjectIdPipe) id: string): Promise<Message> {
    return this.poolService.delete(id);
  }
}

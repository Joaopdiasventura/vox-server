import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PoolService } from "./pool.service";
import { CreatePoolDto } from "./dto/create-pool.dto";
import { UpdatePoolDto } from "./dto/update-pool.dto";
import { Message } from "../../shared/interfaces/messages";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { Pool } from "./entities/pool.entity";
import { FindPoolDto } from "./dto/find-pool.dto";
import { AuthGuard } from "../../shared/modules/auth/guards/auth/auth.guard";

@Controller("pool")
@UseGuards(AuthGuard)
export class PoolController {
  public constructor(private readonly poolService: PoolService) {}

  @Post()
  public create(@Body() createPoolDto: CreatePoolDto): Promise<Message> {
    return this.poolService.create(createPoolDto);
  }

  @Get("findById/:id")
  public findById(@Param("id", ParseObjectIdPipe) id: string): Promise<Pool> {
    return this.poolService.findById(id);
  }

  @Get("findMany/:user")
  public findMany(
    @Param("user", ParseObjectIdPipe) user: string,
    @Query() findPoolDto: FindPoolDto,
  ): Promise<Pool[]> {
    return this.poolService.findMany(user, findPoolDto);
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

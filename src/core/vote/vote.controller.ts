import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { VoteService } from "./vote.service";
import { CreateVoteDto } from "./dto/create-vote.dto";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { Message } from "../../shared/interfaces/messages";
import { Result } from "./interfaces/result";
import { AuthGuard } from "src/shared/modules/auth/guards/auth/auth.guard";

@Controller("vote")
@UseGuards(AuthGuard)
export class VoteController {
  public constructor(private readonly voteService: VoteService) {}

  @Post()
  public create(@Body() createVoteDto: CreateVoteDto): Promise<Message> {
    return this.voteService.create(createVoteDto);
  }

  @Get(":pool")
  public findResult(
    @Param("pool", ParseObjectIdPipe) pool: string,
  ): Promise<Result[]> {
    return this.voteService.findResult(pool);
  }
}

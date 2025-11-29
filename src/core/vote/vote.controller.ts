import {
  UseGuards,
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Message } from '../../shared/interfaces/messages';
import { AuthGuard } from '../../shared/modules/auth/guards/auth/auth.guard';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VoteResult } from './interfaces/vote-result';
import { VoteService } from './vote.service';
import type { AuthRequest } from '../../shared/interfaces/auth-request';

@UseGuards(AuthGuard)
@Controller('vote')
export class VoteController {
  public constructor(private readonly voteService: VoteService) {}

  @Post()
  public create(
    @Body() createVoteDto: CreateVoteDto,
    @Req() req: AuthRequest,
  ): Promise<Message> {
    return this.voteService.create(createVoteDto, req.user);
  }

  @Get(':session')
  public findResult(
    @Param('session', ParseObjectIdPipe) session: string,
  ): Promise<VoteResult[]> {
    return this.voteService.findResult(session);
  }
}

import {
  UseGuards,
  Controller,
  Post,
  Body,
  Get,
  Req,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CreateElectionDto } from './dto/create-election.dto';
import { FindElectionDto } from './dto/find-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { ElectionService } from './election.service';
import { Election } from './entities/election.entity';
import { Message } from '../../shared/interfaces/messages';
import { AuthGuard } from '../../shared/modules/auth/guards/auth/auth.guard';
import type { AuthRequest } from '../../shared/interfaces/auth-request';

@UseGuards(AuthGuard)
@Controller('election')
export class ElectionController {
  public constructor(private readonly electionService: ElectionService) {}

  @Post()
  public create(
    @Body() createElectionDto: CreateElectionDto,
  ): Promise<Message> {
    return this.electionService.create(createElectionDto);
  }

  @Get()
  public findMany(
    @Req() req: AuthRequest,
    @Query() findElectionDto: FindElectionDto,
  ): Promise<Election[]> {
    return this.electionService.findMany(req.user, findElectionDto);
  }

  @Get(':id')
  public findById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Election> {
    return this.electionService.findById(id);
  }

  @Patch(':id')
  public update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateElectionDto: UpdateElectionDto,
  ): Promise<Message> {
    return this.electionService.update(id, updateElectionDto);
  }

  @Delete(':id')
  public delete(@Param('id', ParseObjectIdPipe) id: string): Promise<Message> {
    return this.electionService.delete(id);
  }
}

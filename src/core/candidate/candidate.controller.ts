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
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { FindCandidateDto } from './dto/find-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { Candidate } from './entities/candidate.entity';
import { Message } from '../../shared/interfaces/messages';
import { AuthGuard } from '../../shared/modules/auth/guards/auth/auth.guard';
import type { AuthRequest } from '../../shared/interfaces/auth-request';

@UseGuards(AuthGuard)
@Controller('candidate')
export class CandidateController {
  public constructor(private readonly candidateService: CandidateService) {}

  @Post()
  public create(
    @Body() createCandidateDto: CreateCandidateDto,
  ): Promise<Message> {
    return this.candidateService.create(createCandidateDto);
  }

  @Get()
  public findMany(
    @Req() req: AuthRequest,
    @Query() findCandidateDto: FindCandidateDto,
  ): Promise<Candidate[]> {
    return this.candidateService.findMany(req.user, findCandidateDto);
  }

  @Get(':id')
  public findById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Candidate> {
    return this.candidateService.findById(id);
  }

  @Patch(':id')
  public update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ): Promise<Message> {
    return this.candidateService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  public delete(@Param('id', ParseObjectIdPipe) id: string): Promise<Message> {
    return this.candidateService.delete(id);
  }
}

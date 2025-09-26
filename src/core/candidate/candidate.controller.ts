import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { CandidateService } from "./candidate.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { Candidate } from "./entities/candidate.entity";
import { Message } from "../../shared/interfaces/messages";
import { AuthGuard } from "../../shared/modules/auth/guards/auth/auth.guard";
import { FindCandidateDto } from "./dto/find-candidate.dto";

@Controller("candidate")
@UseGuards(AuthGuard)
export class CandidateController {
  public constructor(private readonly candidateService: CandidateService) {}

  @Post()
  public create(
    @Body() createCandidateDto: CreateCandidateDto,
  ): Promise<Message> {
    return this.candidateService.create(createCandidateDto);
  }

  @Get("findById/:id")
  public findById(
    @Param("id", ParseObjectIdPipe) id: string,
  ): Promise<Candidate> {
    return this.candidateService.findById(id);
  }

  @Get("findMany/:group")
  public findMany(
    @Param("group", ParseObjectIdPipe) group: string,
    @Query() findCandidateDto: FindCandidateDto,
  ): Promise<Candidate[]> {
    return this.candidateService.findMany(group, findCandidateDto);
  }

  @Patch(":id")
  public update(
    @Param("id") id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ): Promise<Message> {
    return this.candidateService.update(id, updateCandidateDto);
  }

  @Delete(":id")
  public delete(@Param("id") id: string): Promise<Message> {
    return this.candidateService.delete(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { CandidateService } from "./candidate.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { Candidate } from "./entities/candidate.entity";
import { Message } from "../../shared/interfaces/messages";

@Controller("candidate")
export class CandidateController {
  public constructor(private readonly candidateService: CandidateService) {}

  @Post()
  public create(
    @Body() createCandidateDto: CreateCandidateDto,
  ): Promise<Message> {
    return this.candidateService.create(createCandidateDto);
  }

  @Get(":id")
  public findById(@Param("id") id: string): Promise<Candidate> {
    return this.candidateService.findById(id);
  }

  @Get("findManyByGroup/:group/:name")
  public findManyByGroup(
    @Param("group", ParseObjectIdPipe) group: string,
    @Param("name") name: string,
  ): Promise<Candidate[]> {
    return this.candidateService.findManyByGroup(group, name);
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

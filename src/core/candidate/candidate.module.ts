import { Module } from "@nestjs/common";
import { CandidateService } from "./candidate.service";
import { CandidateController } from "./candidate.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { CandidateSchema } from "./entities/candidate.entity";
import { GroupModule } from "../group/group.module";
import { MongoCandidateRepository } from "./repositories/candidates.mongo.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Candidate", schema: CandidateSchema }]),
    GroupModule,
  ],
  controllers: [CandidateController],
  providers: [
    CandidateService,
    { provide: "ICandidateRepository", useClass: MongoCandidateRepository },
  ],
  exports: [CandidateService],
})
export class CandidateModule {}

import { Module } from "@nestjs/common";
import { VoteService } from "./vote.service";
import { VoteController } from "./vote.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { VoteSchema } from "./entities/vote.entity";
import { MongoVoteRepository } from "./repositories/vote.mongo.repository";
import { ParticipantModule } from "../participant/participant.module";
import { CommonModule } from "../../shared/modules/common/common.module";
import { VoteGateway } from "./vote.gateway";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Vote", schema: VoteSchema }]),
    ParticipantModule,
    CommonModule,
  ],
  controllers: [VoteController],
  providers: [
    VoteService,
    VoteGateway,
    { provide: "VoteRepository", useClass: MongoVoteRepository },
  ],
})
export class VoteModule {}

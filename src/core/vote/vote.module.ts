import { Module } from "@nestjs/common";
import { VoteService } from "./vote.service";
import { VoteController } from "./vote.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { VoteSchema } from "./entities/vote.entity";
import { PoolModule } from "../pool/pool.module";
import { CandidateModule } from "../candidate/candidate.module";
import { MongoVoteRepository } from "./repositories/vote.mongo.repository";
import { VoteGateway } from "./vote.gateway";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Vote", schema: VoteSchema }]),
    UserModule,
    PoolModule,
    CandidateModule,
  ],
  controllers: [VoteController],
  providers: [
    VoteService,
    VoteGateway,
    { provide: "IVoteRepository", useClass: MongoVoteRepository },
  ],
})
export class VoteModule {}

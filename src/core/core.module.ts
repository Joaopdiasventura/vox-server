import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { GroupModule } from "./group/group.module";
import { ParticipantModule } from "./participant/participant.module";
import { VoteModule } from "./vote/vote.module";

@Module({
  imports: [UserModule, GroupModule, ParticipantModule, VoteModule],
})
export class CoreModule {}

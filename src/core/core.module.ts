import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { GroupModule } from "./group/group.module";
import { PoolModule } from "./pool/pool.module";
import { CandidateModule } from "./candidate/candidate.module";
import { VoteModule } from "./vote/vote.module";
import { PaymentModule } from "./payment/payment.module";
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    UserModule,
    GroupModule,
    PoolModule,
    CandidateModule,
    VoteModule,
    OrderModule,
    PaymentModule,
  ],
})
export class CoreModule {}

import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ElectionModule } from './election/election.module';
import { SessionModule } from './session/session.module';
import { CandidateModule } from './candidate/candidate.module';
import { VoteModule } from './vote/vote.module';
import { BallotBoxModule } from './ballot-box/ballot-box.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    UserModule,
    ElectionModule,
    SessionModule,
    CandidateModule,
    VoteModule,
    BallotBoxModule,
    OrderModule,
    PaymentModule,
  ],
})
export class CoreModule {}

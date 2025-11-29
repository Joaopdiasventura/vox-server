import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoteSchema } from './entities/vote.entity';
import { MongoVoteRepository } from './repositories/vote.mongo.repository';
import { IVoteRepository } from './repositories/vote.repository';
import { VoteController } from './vote.controller';
import { VoteGateway } from './vote.gateway';
import { VoteService } from './vote.service';
import { AuthModule } from '../../shared/modules/auth/auth.module';
import { CandidateModule } from '../candidate/candidate.module';
import { SessionModule } from '../session/session.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Vote', schema: VoteSchema }]),
    AuthModule,
    UserModule,
    SessionModule,
    CandidateModule,
  ],
  controllers: [VoteController],
  providers: [
    VoteService,
    VoteGateway,
    { provide: IVoteRepository, useClass: MongoVoteRepository },
  ],
})
export class VoteModule {}

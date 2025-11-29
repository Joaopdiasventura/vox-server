import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { CandidateSchema } from './entities/candidate.entity';
import { ICandidateRepository } from './repositories/candidate.repository';
import { MongoCandidateRepository } from './repositories/candidate.mongo.repository';
import { AuthModule } from '../../shared/modules/auth/auth.module';
import { ElectionModule } from '../election/election.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Candidate', schema: CandidateSchema }]),
    AuthModule,
    ElectionModule,
  ],
  controllers: [CandidateController],
  providers: [
    CandidateService,
    { provide: ICandidateRepository, useClass: MongoCandidateRepository },
  ],
  exports: [CandidateService],
})
export class CandidateModule {}

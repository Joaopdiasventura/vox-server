import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ElectionController } from './election.controller';
import { ElectionService } from './election.service';
import { ElectionSchema } from './entities/election.entity';
import { IElectionRepository } from './repositories/election.repository';
import { MongoElectionRepository } from './repositories/election.mongo.repository';
import { AuthModule } from '../../shared/modules/auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Election', schema: ElectionSchema }]),
    AuthModule,
    UserModule,
  ],
  controllers: [ElectionController],
  providers: [
    ElectionService,
    { provide: IElectionRepository, useClass: MongoElectionRepository },
  ],
  exports: [ElectionService],
})
export class ElectionModule {}

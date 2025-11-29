import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from './entities/session.entity';
import { MongoSessionRepository } from './repositories/session.mongo.repository';
import { ISessionRepository } from './repositories/session.repository';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { AuthModule } from '../../shared/modules/auth/auth.module';
import { ElectionModule } from '../election/election.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
    ElectionModule,
    AuthModule,
  ],
  controllers: [SessionController],
  providers: [
    SessionService,
    { provide: ISessionRepository, useClass: MongoSessionRepository },
  ],
  exports: [SessionService],
})
export class SessionModule {}

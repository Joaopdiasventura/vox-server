import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { BallotBoxGateway } from './ballot-box.gateway';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [CacheModule.register(), UserModule, SessionModule],
  providers: [BallotBoxGateway],
})
export class BallotBoxModule {}

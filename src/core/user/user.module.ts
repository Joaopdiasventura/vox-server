import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { UserSchema } from './entities/user.entity';
import { MongoUserRepository } from './repositories/user.mongo.repository';
import { IUserRepository } from './repositories/user.repository';
import { UserController } from './user.controller';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';
import { AuthModule } from '../../shared/modules/auth/auth.module';
import { EmailModule } from '../../shared/modules/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    CacheModule.register(),
    AuthModule,
    EmailModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserGateway,
    { provide: IUserRepository, useClass: MongoUserRepository },
  ],
  exports: [UserService],
})
export class UserModule {}

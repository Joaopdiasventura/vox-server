import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./entities/user.entity";
import { MongoUserRepository } from "./repositories/user.mongo.repository";
import { AuthModule } from "../../shared/modules/auth/auth.module";
import { EmailModule } from "../../shared/modules/email/email.module";
import { UserGateway } from "./user.gateway";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    AuthModule,
    EmailModule,
    CacheModule.register(),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserGateway,
    { provide: "IUserRepository", useClass: MongoUserRepository },
  ],
  exports: [UserService],
})
export class UserModule {}

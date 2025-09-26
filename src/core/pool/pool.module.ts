import { Module } from "@nestjs/common";
import { PoolService } from "./pool.service";
import { PoolController } from "./pool.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { PoolSchema } from "./entities/pool.entity";
import { GroupModule } from "../group/group.module";
import { MongoPoolRepository } from "./repositories/pool.mongo.repository";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Pool", schema: PoolSchema }]),
    UserModule,
    GroupModule,
  ],
  controllers: [PoolController],
  providers: [
    PoolService,
    { provide: "IPoolRepository", useClass: MongoPoolRepository },
  ],
  exports: [PoolService],
})
export class PoolModule {}

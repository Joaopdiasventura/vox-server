import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { OrderSchema } from "./entities/order.entity";
import { UserModule } from "../user/user.module";
import { MongoOrderRepository } from "./repositories/order.mongo.repository";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Order", schema: OrderSchema }]),
    UserModule,
    ConfigModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    { provide: "IOrderRepository", useClass: MongoOrderRepository },
  ],
  exports: [OrderService],
})
export class OrderModule {}

import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { MercadopagoService } from "./providers/mercadopago/mercadopago.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "../user/user.module";
import { OrderModule } from "../order/order.module";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentSchema } from "./entities/payment.entity";
import { MongoPaymentRepository } from "./repositories/payment.mongo.repository";
import { PaymentGateway } from './payment.gateway';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: "Payment", schema: PaymentSchema }]),
    UserModule,
    OrderModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentGateway,
    { provide: "IPaymentRepository", useClass: MongoPaymentRepository },
    { provide: "PaymentGatewayProvider", useClass: MercadopagoService },
  ],
})
export class PaymentModule {}

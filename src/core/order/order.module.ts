import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { IOrderRepository } from './repositories/order.repository';
import { MongoOrderRepository } from './repositories/order.mongo.repository';
import { AuthModule } from '../../shared/modules/auth/auth.module';
import { UserModule } from '../user/user.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    ConfigModule,
    AuthModule,
    UserModule,
    PaymentModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    { provide: IOrderRepository, useClass: MongoOrderRepository },
  ],
  exports: [OrderService],
})
export class OrderModule {}

import { CacheModule } from '@nestjs/cache-manager';
import { forwardRef, Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentGateway } from './payment.gateway';
import { PaymentService } from './payment.service';
import { IPaymentProvider } from './providers';
import { AuthModule } from '../../shared/modules/auth/auth.module';
import { OrderModule } from '../order/order.module';
import { UserModule } from '../user/user.module';
import { AbacatepayService } from './providers/abacatepay/abacatepay.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule,
    AuthModule,
    UserModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentGateway,
    { provide: IPaymentProvider, useClass: AbacatepayService },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}

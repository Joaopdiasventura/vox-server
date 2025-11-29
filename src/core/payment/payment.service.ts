import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IPaymentProvider } from './providers';
import { OrderService } from '../order/order.service';
import { UserService } from '../user/user.service';
import { PaymentGateway } from './payment.gateway';
import { SDKPixPaymentPayload } from './providers/payloads';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  public constructor(
    private readonly configService: ConfigService,
    private readonly paymentProvider: IPaymentProvider,
    private readonly paymentGateway: PaymentGateway,
    private readonly userService: UserService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  public async create(id: string): Promise<void> {
    const paymentStatus = await this.paymentProvider.getStatus(id);
    const order = await this.orderService.findById(paymentStatus.order);

    if (!paymentStatus.approved)
      throw new UnauthorizedException('Pagamento não aprovado');

    if (order.payment) throw new BadRequestException('Esse pedido já foi pago');

    await this.orderService.pay(paymentStatus.order, paymentStatus.id);
    await this.userService.update(order.user as unknown as string, {
      plan: order.plan == 'basic' ? undefined : 'pro',
      votes: order.votes,
    });
    this.paymentGateway.orderPaid(paymentStatus.order);
  }

  public async getPayment(
    order: string,
    { products, customer }: Pick<SDKPixPaymentPayload, 'products' | 'customer'>,
  ): Promise<string> {
    const payment = await this.paymentProvider.getPayment({
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      returnUrl: `${this.configService.get('client.url')}/order`,
      completionUrl: `${this.configService.get('client.url')}/user`,
      products,
      customer,
    });

    if (payment.error)
      throw new BadRequestException(
        'Erro ao gerar pagamento, tente novamente mais tarde ou contate o suporte',
      );

    return payment.data!.url;
  }
}

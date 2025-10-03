import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  PixPaymentPayload,
  CardPaymentPayload,
} from "./providers/interfaces/payloads";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { OrderService } from "../order/order.service";
import { Message } from "../../shared/interfaces/messages";
import { SDKPaymentResponse } from "./providers/interfaces/responses";
import { PaymentGateway } from "./payment.gateway";
import type { PaymentGatewayProvider } from "./providers";
import type { PaymentRepository } from "./repositories/payment.repository";
import { UserService } from "../user/user.service";

@Injectable()
export class PaymentService {
  public constructor(
    @Inject("IPaymentRepository")
    private readonly paymentRepository: PaymentRepository,
    @Inject("PaymentGatewayProvider")
    private readonly paymentGatewayProvider: PaymentGatewayProvider,
    private readonly paymentGateway: PaymentGateway,
    private readonly userService: UserService,
    private readonly orderService: OrderService,
  ) {}

  public async create(createPaymentDto: CreatePaymentDto): Promise<Message> {
    const paymentStatus = await this.paymentGatewayProvider.getStatus(
      createPaymentDto.data.id,
    );
    if (!paymentStatus.approved)
      throw new UnauthorizedException("Pagamento não aprovado");
    const { user, plan, votes } = await this.orderService.findById(
      paymentStatus.order,
    );
    await this.paymentRepository.create(createPaymentDto);
    await this.userService.update(user as unknown as string, { plan, votes });
    this.paymentGateway.orderPaid(paymentStatus.order);
    return { message: "Pagamento realizado com sucesso" };
  }

  public async getPixPayment(
    orderId: string,
    payload: PixPaymentPayload,
  ): Promise<SDKPaymentResponse> {
    if (await this.paymentRepository.findByOrder(orderId))
      throw new BadRequestException("Pagamento já realizado para este pedido");

    const order = await this.orderService.findById(orderId);
    const amount = Math.round(order.value) / 100;

    payload.transaction_amount = amount;
    payload.description =
      payload.description || `Pagamento do pedido ${orderId}`;
    payload.payer = payload.payer || { email: "" };
    payload.payer.email = order.user?.email || payload.payer.email;
    payload.payer.first_name = order.user.name || payload.payer.first_name;
    payload.payer.last_name = order.user.email || payload.payer.last_name;
    payload.payer.identification = payload.payer.identification || {
      type: "CPF",
      number: "12345678909",
    };

    payload.transaction_amount = order.value;
    payload.payer = { email: "" };

    if (order.user) payload.payer.email = order.user.email;
    return this.paymentGatewayProvider.getPixPayment(orderId, payload);
  }

  public async getCardPayment(
    orderId: string,
    payload: CardPaymentPayload,
  ): Promise<SDKPaymentResponse> {
    if (await this.paymentRepository.findByOrder(orderId))
      throw new BadRequestException("Pagamento já realizado para este pedido");

    if (!payload.token) throw new BadRequestException("token ausente");
    const order = await this.orderService.findById(orderId);

    payload.transaction_amount = order.value;
    if (order.user) payload.payer = { email: order.user.email };
    if (!payload.installments) payload.installments = 1;
    else payload.installments = parseInt("" + payload.installments);

    return this.paymentGatewayProvider.getCardPayment(orderId, payload);
  }
}

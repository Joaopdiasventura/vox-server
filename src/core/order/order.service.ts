import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrderDto } from './dto/find-order.dto';
import { Order } from './entities/order.entity';
import { IOrderRepository } from './repositories/order.repository';
import { PlanValues } from '../../shared/enums/plan';
import { UserService } from '../user/user.service';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class OrderService {
  private readonly votePrice: number;
  private readonly platformFeeInCents: number;

  public constructor(
    private readonly configService: ConfigService,
    private readonly orderRepository: IOrderRepository,
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
  ) {
    const votePrice = this.configService.get<number>('vote.price');
    if (!votePrice) {
      throw new InternalServerErrorException('Configuração vote.price ausente');
    }

    this.votePrice = votePrice;
    this.platformFeeInCents = 100;
  }

  public async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const user = await this.userService.findById(createOrderDto.user);

    if (!user.taxId) {
      throw new ForbiddenException('Adicione um CPF/CNPJ para criar um pedido');
    }

    const totalValue =
      PlanValues[createOrderDto.plan] + createOrderDto.votes * this.votePrice;

    const order = await this.orderRepository.create({
      ...createOrderDto,
      value: totalValue,
    });

    const products = this.buildProducts(order, createOrderDto);
    const customer = {
      name: user.name,
      email: user.email,
      cellphone: user.cellphone ?? '',
      taxId: user.taxId,
    };

    const paymentUrl = await this.paymentService.getPayment(order.id, {
      products,
      customer,
    });

    await this.orderRepository.update(order.id, { paymentUrl });

    return this.findById(order.id);
  }

  public async findById(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }

  public findMany(user: string, findOrderDto: FindOrderDto): Promise<Order[]> {
    return this.orderRepository.findMany(user, findOrderDto);
  }

  public async pay(id: string, payment: string): Promise<void> {
    await this.orderRepository.update(id, { payment, paymentUrl: undefined });
    const o = await this.findById(id);
    console.log(o);
  }

  private buildProducts(
    order: Order,
    dto: CreateOrderDto,
  ): {
    externalId: string;
    name: string;
    quantity: number;
    price: number;
    description: string;
  }[] {
    const products = [
      {
        externalId: `votes`,
        name: `Votos: ${dto.votes}`,
        quantity: 1,
        price: dto.votes * this.votePrice,
        description: 'Votos por sessão',
      },
    ];

    if (dto.plan == 'pro') {
      products.push({
        externalId: `plan-pro`,
        name: 'Plano Pro',
        quantity: 1,
        price: PlanValues.pro,
        description: 'Plano para aumento da quantidade de urnas',
      });
    }

    products.push({
      externalId: order.id,
      name: 'Taxa',
      quantity: 1,
      price: this.platformFeeInCents,
      description: 'Taxa da plataforma de pagamento',
    });

    return products;
  }
}

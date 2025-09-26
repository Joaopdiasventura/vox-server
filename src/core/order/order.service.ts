import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import type { OrderRepository } from "./repositories/order.repository";
import { UserService } from "../user/user.service";
import { Message } from "../../shared/interfaces/messages";
import { PlanValues } from "./enums/plan";
import { ConfigService } from "@nestjs/config";
import { Order } from "./entities/order.entity";
import { FindOrderDto } from "./dto/find-order.dto";

@Injectable()
export class OrderService {
  public constructor(
    @Inject("IOrderRepository")
    private readonly orderRepository: OrderRepository,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  public async create(createOrderDto: CreateOrderDto): Promise<Message> {
    const { votes } = await this.userService.findById(createOrderDto.user);
    createOrderDto.value =
      PlanValues[createOrderDto.plan] +
      (createOrderDto.votes == votes ? 0 : createOrderDto.votes) *
        this.configService.get<number>("vote.price")!;
    const { id } = await this.orderRepository.create(createOrderDto);
    return { message: id };
  }

  public async findById(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException("Pedido não encontrado");
    return order;
  }

  public findMany(user: string, findOrderDto: FindOrderDto): Promise<Order[]> {
    return this.orderRepository.findMany(user, findOrderDto);
  }

  public async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Message> {
    const { payment } = await this.findById(id);
    if (payment)
      throw new UnauthorizedException("Não é possível alterar um pedido pago");
    await this.orderRepository.update(id, updateOrderDto);
    return { message: "Pedido atualizado com sucesso" };
  }

  public async delete(id: string): Promise<Message> {
    const { payment } = await this.findById(id);
    if (payment)
      throw new UnauthorizedException("Não é possível deletar um pedido pago");
    await this.orderRepository.delete(id);
    return { message: "Pedido deletado com sucesso" };
  }
}

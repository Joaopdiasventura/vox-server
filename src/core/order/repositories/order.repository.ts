import { CreateOrderDto } from "../dto/create-order.dto";
import { FindOrderDto } from "../dto/find-order.dto";
import { UpdateOrderDto } from "../dto/update-order.dto";
import { Order } from "../entities/order.entity";

export interface OrderRepository {
  create(createOrderDto: CreateOrderDto): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findMany(user: string, findOrderDto: FindOrderDto): Promise<Order[]>;
  update(id: string, updateOrderDto: UpdateOrderDto): Promise<void>;
  delete(id: string): Promise<void>;
}

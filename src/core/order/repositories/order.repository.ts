import { CreateOrderDto } from '../dto/create-order.dto';
import { FindOrderDto } from '../dto/find-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Order } from '../entities/order.entity';

export abstract class IOrderRepository {
  public abstract create(createOrderDto: CreateOrderDto): Promise<Order>;
  public abstract findById(id: string): Promise<Order | null>;
  public abstract findMany(
    user: string,
    findOrderDto: FindOrderDto,
  ): Promise<Order[]>;
  public abstract update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<void>;
  public abstract delete(id: string): Promise<void>;
}

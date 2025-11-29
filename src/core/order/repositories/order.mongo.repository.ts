import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, UpdateQuery } from 'mongoose';
import { IOrderRepository } from './order.repository';
import { CreateOrderDto } from '../dto/create-order.dto';
import { FindOrderDto } from '../dto/find-order.dto';
import { Order } from '../entities/order.entity';
import { UpdateOrderDto } from '../dto/update-order.dto';

export class MongoOrderRepository implements IOrderRepository {
  public constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
  ) {}

  public create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderModel.insertOne(createOrderDto);
  }

  public findById(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).exec();
  }

  public findMany(user: string, findOrderDto: FindOrderDto): Promise<Order[]> {
    const pipeline: PipelineStage[] = [{ $match: { user: `${user}` } }];

    if (findOrderDto.isPaid)
      pipeline.push({
        $match: {
          payment: { $exists: true },
        },
      });

    if (findOrderDto.name)
      pipeline.push({
        $match: {
          name: { $regex: findOrderDto.name.trim(), $options: 'i' },
        },
      });

    if (findOrderDto.orderBy) {
      const [field, direction] = findOrderDto.orderBy.split(':');
      if (field && direction)
        pipeline.push({
          $sort: {
            [field]: direction == 'desc' ? -1 : 1,
            _id: 1,
          },
        });
    } else pipeline.push({ $sort: { group: 1, isSubgroup: 1, name: 1 } });

    if (findOrderDto.limit && findOrderDto.limit > 0) {
      if (findOrderDto.page && findOrderDto.page >= 0)
        pipeline.push({ $skip: findOrderDto.page * findOrderDto.limit });
      pipeline.push({ $limit: findOrderDto.limit });
    }

    return this.orderModel.aggregate<Order>(pipeline).exec();
  }

  public async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<void> {
    const updateQuery: UpdateQuery<Order> = { $set: {}, $unset: {} };

    for (const key in updateOrderDto)
      if (updateOrderDto[key]) updateQuery.$set[key] = updateOrderDto[key];
      else updateQuery.$unset![key] = 1;

    await this.orderModel.findByIdAndUpdate(id, updateQuery).exec();
  }

  public async delete(id: string): Promise<void> {
    await this.orderModel.findByIdAndDelete(id).exec();
  }
}

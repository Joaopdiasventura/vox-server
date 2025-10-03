import { InjectModel } from "@nestjs/mongoose";
import { CreateOrderDto } from "../dto/create-order.dto";
import { UpdateOrderDto } from "../dto/update-order.dto";
import { FindOrderDto } from "../dto/find-order.dto";
import { Order } from "../entities/order.entity";
import { OrderRepository } from "./order.repository";
import { Model, PipelineStage } from "mongoose";

export class MongoOrderRepository implements OrderRepository {
  public constructor(
    @InjectModel("Order") private readonly orderModel: Model<Order>,
  ) {}

  public create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderModel.insertOne(createOrderDto);
  }

  public findById(id: string): Promise<Order | null> {
    return this.orderModel
      .findById(id)
      .populate({ path: "user", select: "email name" })
      .exec();
  }

  public findMany(
    user: string,
    { limit, page, orderBy }: FindOrderDto,
  ): Promise<Order[]> {
    const pipeline: PipelineStage[] = [{ $match: { user: `${user}` } }];

    if (orderBy) {
      const [field, direction] = orderBy.split(":");
      if (field && direction)
        pipeline.push({
          $sort: {
            [field]: direction == "desc" ? -1 : 1,
            _id: 1,
          },
        });
    } else pipeline.push({ $sort: { createdAt: -1 } });

    if (limit && limit > 0) {
      pipeline.push({ $limit: limit });
      if (page && page >= 0) pipeline.push({ $skip: page * limit });
    }

    pipeline.push({ $project: { parentGroup: 0, isSubgroup: 0, idString: 0 } });

    return this.orderModel.aggregate<Order>(pipeline).exec();
  }

  public async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<void> {
    await this.orderModel.findByIdAndUpdate(id, updateOrderDto).exec();
  }

  public async delete(id: string): Promise<void> {
    await this.orderModel.findByIdAndDelete(id).exec();
  }
}

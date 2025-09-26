import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { AuthGuard } from "../../shared/modules/auth/guards/auth/auth.guard";
import { Message } from "../../shared/interfaces/messages";
import { Order } from "./entities/order.entity";
import { FindOrderDto } from "./dto/find-order.dto";

@Controller("order")
@UseGuards(AuthGuard)
export class OrderController {
  public constructor(private readonly orderService: OrderService) {}

  @Post()
  public create(@Body() createOrderDto: CreateOrderDto): Promise<Message> {
    return this.orderService.create(createOrderDto);
  }

  @Get("findById/:id")
  public findById(@Param("id") id: string): Promise<Order> {
    return this.orderService.findById(id);
  }

  @Get("findMany/:user")
  public findMany(
    @Param("user") user: string,
    @Query() findOrderDto: FindOrderDto,
  ): Promise<Order[]> {
    return this.orderService.findMany(user, findOrderDto);
  }

  @Patch(":id")
  public update(
    @Param("id") id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Message> {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(":id")
  public delete(@Param("id") id: string): Promise<Message> {
    return this.orderService.delete(id);
  }
}

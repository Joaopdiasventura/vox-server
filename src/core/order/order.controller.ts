import {
  UseGuards,
  Controller,
  Post,
  Body,
  Get,
  Req,
  Query,
  Param,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrderDto } from './dto/find-order.dto';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { AuthGuard } from '../../shared/modules/auth/guards/auth/auth.guard';
import type { AuthRequest } from '../../shared/interfaces/auth-request';

@UseGuards(AuthGuard)
@Controller('order')
export class OrderController {
  public constructor(private readonly orderService: OrderService) {}

  @Post()
  public create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() { user }: AuthRequest,
  ): Promise<Order> {
    return this.orderService.create({ ...createOrderDto, user });
  }

  @Get()
  public findMany(
    @Req() req: AuthRequest,
    @Query() findOrderDto: FindOrderDto,
  ): Promise<Order[]> {
    return this.orderService.findMany(req.user, findOrderDto);
  }

  @Get(':id')
  public findById(@Param('id', ParseObjectIdPipe) id: string): Promise<Order> {
    return this.orderService.findById(id);
  }
}

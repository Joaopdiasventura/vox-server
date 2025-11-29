import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import type { Plan } from '../../../shared/types/plan';

@Schema({ versionKey: false, timestamps: true })
export class Order extends Document<string, Order, Order> {
  @Prop({ required: true })
  public plan: Plan;

  @Prop({ required: true, index: true, type: String, ref: 'User' })
  public user: User;

  @Prop({ required: true })
  public value: number;

  @Prop({ required: true })
  public votes: number;

  @Prop({ required: false })
  public payment: string;

  @Prop({ required: false })
  public paymentUrl: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

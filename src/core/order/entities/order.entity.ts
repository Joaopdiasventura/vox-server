import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { User } from "../../user/entities/user.entity";
import { Payment } from "../../payment/entities/payment.entity";
import type { Plan } from "../types/plan";

@Schema({ versionKey: false, timestamps: true })
export class Order extends Document<string, Order, Order> {
  @Prop({ required: true })
  public plan: Plan;

  @Prop({ required: true })
  public value: number;

  @Prop({ required: true })
  public votes: number;

  @Prop({ required: true, index: true, type: String, ref: "User" })
  public user: User;

  @Prop({ required: false, type: String, ref: "Payment" })
  public payment?: Payment;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ versionKey: false, timestamps: true })
export class Payment extends Document<string, Payment, Payment> {
  @Prop({ required: true })
  public method: string;

  @Prop({ required: true })
  public value: number;

  @Prop({ required: true, index: true, type: String, ref: "Order" })
  public order: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

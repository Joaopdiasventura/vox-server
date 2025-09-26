import { InjectModel } from "@nestjs/mongoose";
import { CreatePaymentDto } from "../dto/create-payment.dto";
import { Payment } from "../entities/payment.entity";
import { PaymentRepository } from "./payment.repository";
import { Model } from "mongoose";

export class MongoPaymentRepository implements PaymentRepository {
  public constructor(
    @InjectModel("Payment") private readonly paymentModel: Model<Payment>,
  ) {}

  public create({ data }: CreatePaymentDto): Promise<Payment> {
    return this.paymentModel.insertOne(data);
  }

  public findByOrder(order: string): Promise<Payment | null> {
    return this.paymentModel.findOne({ order }).exec();
  }
}

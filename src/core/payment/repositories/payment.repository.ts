import { CreatePaymentDto } from "../dto/create-payment.dto";
import { Payment } from "../entities/payment.entity";

export interface PaymentRepository {
  create({ data }: CreatePaymentDto): Promise<Payment>;
  findByOrder(order: string): Promise<Payment | null>;
}

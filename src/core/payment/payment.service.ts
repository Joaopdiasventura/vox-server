import { Injectable } from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

@Injectable()
export class PaymentService {
  public create(createPaymentDto: CreatePaymentDto): string {
    console.log(createPaymentDto);
    return "This action adds a new payment";
  }

  public findAll(): string {
    return `This action returns all payment`;
  }

  public findOne(id: number): string {
    return `This action returns a #${id} payment`;
  }

  public update(id: number, updatePaymentDto: UpdatePaymentDto): string {
    console.log(updatePaymentDto);
    return `This action updates a #${id} payment`;
  }

  public remove(id: number): string {
    return `This action removes a #${id} payment`;
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

@Controller("payment")
export class PaymentController {
  public constructor(private readonly paymentService: PaymentService) {}

  @Post()
  public create(@Body() createPaymentDto: CreatePaymentDto): string {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  public findAll(): string {
    return this.paymentService.findAll();
  }

  @Get(":id")
  public findOne(@Param("id") id: string): string {
    return this.paymentService.findOne(+id);
  }

  @Patch(":id")
  public update(@Param("id") id: string, @Body() updatePaymentDto: UpdatePaymentDto): string {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(":id")
  public remove(@Param("id") id: string): string {
    return this.paymentService.remove(+id);
  }
}

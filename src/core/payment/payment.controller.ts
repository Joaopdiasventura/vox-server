import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { AuthGuard } from "../../shared/modules/auth/guards/auth/auth.guard";
import { Message } from "../../shared/interfaces/messages";
import { SDKPaymentResponse } from "./providers/interfaces/responses";
import type {
  PixPaymentPayload,
  CardPaymentPayload,
} from "./providers/interfaces/payloads";
import { ParseObjectIdPipe } from "@nestjs/mongoose";

@Controller("payment")
export class PaymentController {
  public constructor(private readonly paymentService: PaymentService) {}

  @Post()
  public create(@Body() createPaymentDto: CreatePaymentDto): Promise<Message> {
    return this.paymentService.create(createPaymentDto);
  }

  @Post("pix/:order")
@UseGuards(AuthGuard)
  public getPixPayment(
    @Param("order", ParseObjectIdPipe) order: string,
    @Body() payload: PixPaymentPayload,
  ): Promise<SDKPaymentResponse> {
    return this.paymentService.getPixPayment(order, payload);
  }

  @Post("card/:order")
@UseGuards(AuthGuard)
  public getCardPayment(
    @Param("order", ParseObjectIdPipe) order: string,
    @Body() payload: CardPaymentPayload,
  ): Promise<SDKPaymentResponse> {
    return this.paymentService.getCardPayment(order, payload);
  }
}

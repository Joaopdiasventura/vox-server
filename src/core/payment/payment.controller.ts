import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { WebHookPayload } from './providers/payloads';

@Controller('payment')
export class PaymentController {
  public constructor(private readonly paymentService: PaymentService) {}

  @Post()
  public create(@Body() { data }: WebHookPayload): Promise<void> {
    if (data) return this.paymentService.create(data.billing.id);
    return new Promise((resolve) => resolve());
  }
}

// bill_40MuFR3AHbKA3Kuwb0gCbRwY
// bill_40MuFR3AHbKA3Kuwb0gCbRwY

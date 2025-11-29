import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBillingData,
  CreateBillingResponse,
  IBilling,
} from 'abacatepay-nodejs-sdk/dist/types';
import { IPaymentProvider, PaymentStatus } from '..';

@Injectable()
export class AbacatepayService implements IPaymentProvider {
  private readonly token: string;

  public constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('abacatepay.token')!;
  }

  public async getPayment(
    payload: CreateBillingData,
  ): Promise<CreateBillingResponse> {
    if (!this.token)
      throw new InternalServerErrorException('AbacatePay token not configured');

    const response = await fetch(
      'https://api.abacatepay.com/v1/billing/create',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const body = await response.json();

    if (!response.ok || body.error)
      throw new BadRequestException(
        body.error?.message ?? 'Error creating payment',
      );

    if (!body.data)
      throw new InternalServerErrorException('Empty response from AbacatePay');

    return body;
  }

  public async getStatus(id: string): Promise<PaymentStatus> {
    if (!this.token)
      throw new InternalServerErrorException('AbacatePay token not configured');

    const url = 'https://api.abacatepay.com/v1/billing/list';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    const { error, data }: { error: string; data: IBilling[] } =
      await response.json();

    const payment = data.find((p) => p.id == id);
    console.log(payment);

    if (response.status == 404 || !payment)
      throw new NotFoundException('Pagamento não encontrado');

    if (!response.ok)
      throw new BadRequestException(error ?? 'Pagamento inválido');

    const approved = payment.status.toUpperCase() == 'PAID';

    return {
      approved,
      order: payment.products[payment.products.length - 1].externalId,
      id: payment.id,
    };
  }
}

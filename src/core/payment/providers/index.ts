import { SDKPixPaymentPayload } from './payloads';
import { SDKPixPaymentResponse } from './responses';

export interface PaymentStatus {
  approved: boolean;
  order: string;
  id: string;
}

export abstract class IPaymentProvider {
  public abstract getPayment(
    payload: SDKPixPaymentPayload,
  ): Promise<SDKPixPaymentResponse>;

  public abstract getStatus(id: string): Promise<PaymentStatus>;
}

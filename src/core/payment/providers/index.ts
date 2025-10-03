import { PixPaymentPayload, CardPaymentPayload } from "./interfaces/payloads";
import { SDKPaymentResponse } from "./interfaces/responses";

export interface PaymentStatus {
  approved: boolean;
  order: string;
  method: string;
  value: number;
}

export interface PaymentGatewayProvider {
  getPixPayment(
    order: string,
    payload: PixPaymentPayload,
  ): Promise<SDKPaymentResponse>;

  getCardPayment(
    order: string,
    payload: CardPaymentPayload,
  ): Promise<SDKPaymentResponse>;

  getStatus(id: string): Promise<PaymentStatus>;
}

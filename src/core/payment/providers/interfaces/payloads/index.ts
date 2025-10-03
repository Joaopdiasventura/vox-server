export type IdentificationType = "CPF" | "CNPJ";

export interface PayerIdentification {
  type: IdentificationType;
  number: string;
}

export interface Payer {
  email: string;
  first_name?: string;
  last_name?: string;
  identification?: PayerIdentification;
}

export interface BasePaymentPayload {
  transaction_amount: number;
  description: string;
  payer: Payer;
  external_reference?: string;
  notification_url?: string;
}

export interface PixPaymentPayload extends BasePaymentPayload {
  payment_method_id: "pix";
  date_of_expiration?: string;
}

export interface CardPaymentPayload extends BasePaymentPayload {
  payment_method_id: string;
  token: string;
  installments: number;
  issuer_id?: number;
}

export type MercadoPagoPaymentPayload = PixPaymentPayload | CardPaymentPayload;

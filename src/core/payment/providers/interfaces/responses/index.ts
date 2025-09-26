import { Payment } from "mercadopago";

export type SDKPaymentResponse = Awaited<ReturnType<Payment["create"]>>;

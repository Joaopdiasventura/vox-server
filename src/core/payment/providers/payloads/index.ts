import {
  CreateBillingData,
  IBilling,
  ICustomerMetadata,
} from 'abacatepay-nodejs-sdk/dist/types';

export type SDKPixPaymentPayload = Extract<
  CreateBillingData,
  { customer: ICustomerMetadata }
>;

export type WebHookPayload = { data: { billing: IBilling } };

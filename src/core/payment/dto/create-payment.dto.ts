import { IsNotEmpty } from "class-validator";

export class CreatePaymentDto {
  @IsNotEmpty() public data?: { id: string };

  public approved: boolean;
  public order: string;
  public method: string;
  public value: number;
}

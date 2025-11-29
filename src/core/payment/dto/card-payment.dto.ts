import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { PayerDto } from './pix-payment.dto';

export class CardPaymentDto {
  @IsString({ message: 'Token do cartão deve ser texto' })
  @IsNotEmpty({ message: 'Token do cartão é obrigatório' })
  public token: string;

  @IsInt({ message: 'Parcelas deve ser um número inteiro' })
  @Min(1, { message: 'Parcelas deve ser no mínimo 1' })
  public installments: number;

  @IsInt({ message: 'ID do emissor deve ser inteiro' })
  @IsPositive({ message: 'ID do emissor deve ser positivo' })
  @IsOptional()
  public issuer_id?: number;

  @IsString({ message: 'Descrição deve ser texto' })
  @IsOptional()
  public description: string;

  @IsString({ message: 'Referência externa deve ser texto' })
  @IsOptional()
  public external_reference?: string;

  @IsString({ message: 'URL de notificação deve ser texto' })
  @IsOptional()
  public notification_url?: string;

  public payment_method_id: string;
  public transaction_amount: number;
  public payer: PayerDto;
}

import {
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PayerIdentificationDto {
  @IsIn(['CPF', 'CNPJ'], {
    message: "Tipo de identificação deve ser 'CPF' ou 'CNPJ'",
  })
  public type: 'CPF' | 'CNPJ';

  @IsString({ message: 'Número de identificação deve ser texto' })
  @IsNotEmpty({ message: 'Número de identificação é obrigatório' })
  public number: string;
}

export class PayerDto {
  public email: string;

  @IsString({ message: 'Nome deve ser texto' })
  @IsOptional()
  public first_name?: string;

  @IsString({ message: 'Sobrenome deve ser texto' })
  @IsOptional()
  public last_name?: string;

  @ValidateNested()
  @Type(() => PayerIdentificationDto)
  @IsOptional()
  public identification?: PayerIdentificationDto;
}

export class PixPaymentDto {
  @IsString({ message: 'Referência externa deve ser texto' })
  @IsOptional()
  public external_reference?: string;

  @IsString({ message: 'URL de notificação deve ser texto' })
  @IsOptional()
  public notification_url?: string;

  @IsISO8601({ strict: false }, { message: 'Data de expiração inválida' })
  @IsOptional()
  public date_of_expiration?: string;

  public description: string;
  public payment_method_id: 'pix';
  public transaction_amount: number;
  public payer: PayerDto;
}

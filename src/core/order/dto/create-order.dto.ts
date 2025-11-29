import { IsEnum, IsInt, Min } from 'class-validator';
import { PlanValues } from '../../../shared/enums/plan';
import type { Plan } from '../../../shared/types/plan';

export class CreateOrderDto {
  @IsEnum(PlanValues, { message: 'Plano inválido' })
  public plan: Plan;

  @IsInt({ message: 'Quantidade de votos inválida' })
  @Min(100, { message: 'Não é possivel pedir menos que 100 votos' })
  public votes: number;

  public value: number;

  public user: string;
  public payment: string;
  public paymentUrl: string;
}

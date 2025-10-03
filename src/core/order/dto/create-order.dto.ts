import { IsEnum, IsMongoId, IsNumber } from "class-validator";
import type { Plan } from "../types/plan";
import { PlanValues } from "../enums/plan";

export class CreateOrderDto {
  @IsEnum(PlanValues, { message: "Selecione um plano válido" })
  public plan: Plan;

  @IsNumber({}, { message: "Selecione uma quantidade de votos válida" })
  public votes: number;

  @IsMongoId({ message: "Faça login novamente" })
  public user: string;

  public value: number;
}

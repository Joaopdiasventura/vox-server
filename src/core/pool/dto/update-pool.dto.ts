import { IsDate, IsNumber, IsOptional } from "class-validator";

export class UpdatePoolDto {
  @IsOptional()
  @IsDate({ message: "Digite uma data de inicio válida" })
  public start?: Date;

  @IsOptional()
  @IsDate({ message: "Digite uma data de fim válida" })
  public end?: Date;

  @IsNumber({}, { message: "Digite um valor valido" })
  public votes?: number;
}

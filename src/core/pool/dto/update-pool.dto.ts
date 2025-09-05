import { IsDate, IsOptional } from "class-validator";

export class UpdatePoolDto {
  @IsOptional()
  @IsDate({ message: "Digite uma data de inicio válida" })
  public start?: Date;

  @IsOptional()
  @IsDate({ message: "Digite uma data de fim válida" })
  public end?: Date;
}

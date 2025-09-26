import { IsDateString, IsMongoId } from "class-validator";

export class CreatePoolDto {
  @IsMongoId({ message: "Grupo inválido" })
  public group: string;

  @IsDateString({}, { message: "Digite uma data de inicio válida" })
  public start: Date;

  @IsDateString({}, { message: "Digite uma data de fim válida" })
  public end: Date;
}

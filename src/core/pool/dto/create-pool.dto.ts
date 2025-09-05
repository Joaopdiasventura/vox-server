import { IsDate, IsMongoId } from "class-validator";

export class CreatePoolDto {
  @IsMongoId({ message: "Grupo inválido" })
  public group: string;

  @IsDate({ message: "Digite uma data de inicio válida" })
  public start: Date;

  @IsDate({ message: "Digite uma data de fim válida" })
  public end: Date;
}

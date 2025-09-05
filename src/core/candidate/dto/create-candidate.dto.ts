import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateCandidateDto {
  @IsString({ message: "Digite um nome válido" })
  @IsNotEmpty({ message: "Digite um nome válido" })
  public name: string;

  @IsMongoId({ message: "Grupo inválido" })
  public group: string;
}

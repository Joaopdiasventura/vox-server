import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateGroupDto {
  @IsString({ message: "Digite um nome válido" })
  @IsNotEmpty({ message: "Digite um nome válido" })
  public name: string;

  @IsMongoId({ message: "Usuário inválido" })
  public user: string;

  @IsOptional()
  @IsMongoId({ message: "Grupo inválido" })
  public group?: string;
}

import { IsMongoId, IsOptional } from "class-validator";

export class CreateVoteDto {
  @IsMongoId({ message: "Votação inválida" })
  public pool: string;

  @IsOptional()
  @IsMongoId({ message: "Grupo inválido" })
  public candidate?: string;
}

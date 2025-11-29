import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateCandidateDto {
  @IsString({ message: 'Digite um nome válido' })
  @IsNotEmpty({ message: 'Digite um nome válido' })
  public name: string;

  @IsMongoId({ message: 'Eleição inválida' })
  public election: string;
}

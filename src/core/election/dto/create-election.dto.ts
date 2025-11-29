import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateElectionDto {
  @IsString({ message: 'Digite um nome válido' })
  @IsNotEmpty({ message: 'Digite um nome válido' })
  public name: string;

  @IsMongoId({ message: 'Faça login novamente' })
  public user: string;
}

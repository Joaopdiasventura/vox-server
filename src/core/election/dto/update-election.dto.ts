import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateElectionDto {
  @IsString({ message: 'Digite um nome válido' })
  @IsNotEmpty({ message: 'Digite um nome válido' })
  public name: string;
}

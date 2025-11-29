import { IsMongoId, IsOptional } from 'class-validator';

export class CreateVoteDto {
  @IsMongoId({ message: 'Eleição inválida' })
  public election: string;

  @IsMongoId({ message: 'Sessão inválida' })
  public session: string;

  @IsOptional()
  @IsMongoId({ message: 'Candidato inválido' })
  public candidate?: string;
}

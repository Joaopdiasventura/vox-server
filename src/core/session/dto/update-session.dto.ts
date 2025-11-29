import { IsDate, IsOptional } from 'class-validator';

export class UpdateSessionDto {
  @IsOptional()
  @IsDate({ message: 'Data de inicio inválida' })
  public startedAt: Date;

  @IsOptional()
  @IsDate({ message: 'Data de encerramento inválida' })
  public endedAt: Date;

  public votes?: number;
}

import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsMongoId,
} from 'class-validator';

export class CreateSessionDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Selecione pelo menos uma eleição' })
  @ArrayMaxSize(3, { message: 'Você pode selecionar no máximo 3 eleições' })
  @IsMongoId({ each: true, message: 'Eleição inválida' })
  public elections: string[];

  @IsDate({ message: 'Data de inicio inválida' })
  public startedAt: Date;

  @IsDate({ message: 'Data de encerramento inválida' })
  public endedAt: Date;
}

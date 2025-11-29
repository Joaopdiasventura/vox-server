import { IsOptional, IsNumber, IsString } from 'class-validator';

export class FindElectionDto {
  @IsOptional()
  @IsNumber()
  public page?: number;

  @IsOptional()
  @IsNumber()
  public limit?: number;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public orderBy?: string;
}

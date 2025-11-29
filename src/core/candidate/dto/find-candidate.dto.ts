import { IsOptional, IsNumber, IsString, IsMongoId } from 'class-validator';

export class FindCandidateDto {
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

  @IsOptional()
  @IsMongoId()
  public election?: string;
}

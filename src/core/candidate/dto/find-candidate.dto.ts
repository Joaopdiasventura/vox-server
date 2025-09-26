import { IsNumber, IsOptional, IsString } from "class-validator";

export class FindCandidateDto {
  @IsOptional()
  @IsNumber()
  public page?: number;

  @IsOptional()
  @IsNumber()
  public limit?: number;

  @IsOptional()
  @IsString()
  public orderBy?: string;
}

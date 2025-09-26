import { IsNumber, IsOptional, IsString } from "class-validator";

export class FindPoolDto {
  @IsOptional()
  @IsNumber()
  public page?: number;

  @IsOptional()
  @IsNumber()
  public limit?: number;

  @IsOptional()
  @IsString()
  public orderBy?: string;

  @IsOptional()
  @IsString()
  public group?: string;
}

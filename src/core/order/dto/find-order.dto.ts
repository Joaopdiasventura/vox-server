import { IsOptional, IsNumber, IsString } from "class-validator";

export class FindOrderDto {
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

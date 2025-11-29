import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';

export class FindOrderDto {
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
  @IsBoolean()
  public isPaid?: boolean;
}

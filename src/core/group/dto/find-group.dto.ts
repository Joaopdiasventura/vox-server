import {
  IsBooleanString,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class FindGroupDto {
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
  @IsBooleanString()
  public withSubGroups?: boolean;

  @IsOptional()
  @IsBooleanString()
  public withCandidates?: boolean;
}

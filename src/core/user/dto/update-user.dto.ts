import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, Matches } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @Matches(/^(\d{11}|\d{14})$/)
  public taxId?: string;

  @IsOptional()
  @Matches(/^(\d{11})$/)
  public cellphone?: string;

  public plan?: string;
  public votes?: number;
  public isValid?: boolean;
}

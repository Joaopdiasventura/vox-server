import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { LoginUserDto } from "../../../core/user/dto/login-user.dto";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

@Injectable()
export class ParseLoginUserDtoPipe implements PipeTransform {
  public transform(value: LoginUserDto): LoginUserDto {
    const dto = plainToInstance(LoginUserDto, value);
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0)
      throw new BadRequestException(
        errors.flatMap((err) => Object.values(err.constraints!)),
      );

    return dto;
  }
}

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Digite um email válido' })
  public email: string;

  @IsString({ message: 'Digite um nome válido' })
  @IsNotEmpty({ message: 'Digite um nome válido' })
  public name: string;

  @IsStrongPassword(
    {},
    {
      message:
        'Digite uma senha com ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos',
    },
  )
  public password: string;
}

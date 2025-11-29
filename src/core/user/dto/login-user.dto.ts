import { IsEmail, IsStrongPassword } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Digite um email válido' })
  public email: string;

  @IsStrongPassword(
    {},
    {
      message:
        'Digite uma senha com ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos',
    },
  )
  public password: string;
}

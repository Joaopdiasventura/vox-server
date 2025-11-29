import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserRepository } from './repositories/user.repository';
import { UserGateway } from './user.gateway';
import { User } from './entities/user.entity';
import { Message } from '../../shared/interfaces/messages';
import { AuthMessage } from '../../shared/interfaces/messages/auth';
import { AuthService } from '../../shared/modules/auth/auth.service';
import { EmailService } from '../../shared/modules/email/email.service';

@Injectable()
export class UserService {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly userGateway: UserGateway,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<Message> {
    await this.throwIfEmailIsUsed(createUserDto.email);

    createUserDto.password = await this.authService.hashPassword(
      createUserDto.password,
    );

    const result = await this.userRepository.create(createUserDto);
    const user = result.toObject();
    delete user.password;

    const token = await this.authService.generateToken(result.id);

    await this.emailService.enqueueMail({
      to: user.email,
      subject: 'Validação de conta',
      html: this.emailService.createAccountValidationMessage(token),
    });

    return {
      message: 'Conta criada com sucesso, valide ela no email: ' + result.email,
    };
  }

  public async login(loginUserDto: LoginUserDto): Promise<AuthMessage> {
    const result = await this.findByEmail(loginUserDto.email);

    if (!result.isValid)
      throw new UnauthorizedException('Valide sua conta antes de fazer login');

    await this.authService.comparePassword(
      loginUserDto.password,
      result.password!,
    );

    const user = result.toObject();
    delete user.password;

    const token = await this.authService.generateToken(result.id);

    return { message: 'Login realizado com sucesso', token, user };
  }

  public async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Conta não encontrada');
    return user;
  }

  public async decodeToken(token: string): Promise<User> {
    const id = await this.authService.decodeToken(token);
    const user = await this.findById(id);
    delete user.password;
    return user;
  }

  public async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Message> {
    const user = await this.findById(id);

    if (updateUserDto.email && user.email != updateUserDto.email) {
      updateUserDto.isValid = false;
      const token = await this.authService.generateToken(id);
      await this.emailService.enqueueMail({
        to: updateUserDto.email,
        subject: 'Validação de conta',
        html: this.emailService.createAccountValidationMessage(token),
      });
    }

    if (
      updateUserDto.taxId &&
      (!user.taxId || updateUserDto.taxId != user.taxId)
    )
      if (updateUserDto.taxId.length == 11)
        await this.validateCPF(updateUserDto.taxId);
      else await this.validateCNPJ(updateUserDto.taxId);

    if (updateUserDto.password)
      updateUserDto.password = await this.authService.hashPassword(
        updateUserDto.password,
      );

    await this.userRepository.update(id, updateUserDto);

    return { message: 'Conta atualizada com sucesso' };
  }

  public async resetPassword(email: string): Promise<void> {
    const { id } = await this.findByEmail(email);
    const randomPassword = this.authService.generateRandomPassword();
    const newPassword = await this.authService.hashPassword(randomPassword);
    await this.userRepository.update(id, { password: newPassword });
    this.emailService.enqueueMail({
      to: email,
      subject: 'Nova senha VOX',
      html: this.emailService.createNewPasswordMessage(randomPassword),
    });
  }

  public async validateAccount(token: string): Promise<User> {
    const user = await this.decodeToken(token);
    delete user.password;
    if (user.isValid)
      throw new BadRequestException('Essa conta já foi validada');
    await this.userRepository.update(user._id, { isValid: true });
    await this.userGateway.onAccountValidated(user);
    return user;
  }

  public async delete(id: string): Promise<Message> {
    await this.findById(id);
    await this.userRepository.delete(id);
    return { message: 'Conta deletada com sucesso' };
  }

  private async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('Conta não encontrada');
    return user;
  }

  private async throwIfEmailIsUsed(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (user)
      throw new BadRequestException('Esse email já está sendo utilizado');
  }

  private async throwIfItsUsed(taxId: string, field: string): Promise<void> {
    const user = await this.userRepository.findByTaxId(taxId);
    if (user) {
      throw new BadRequestException(`Esse ${field} já está sendo utilizado`);
    }
  }

  private async validateCPF(cpf: string): Promise<void> {
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);

    let firstDigit = (sum * 10) % 11;
    if (firstDigit == 10 || firstDigit == 11) firstDigit = 0;
    if (firstDigit != Number(cpf[9]))
      throw new BadRequestException('CPF inválido');

    sum = 0;
    for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);

    let secondDigit = (sum * 10) % 11;
    if (secondDigit == 10 || secondDigit == 11) secondDigit = 0;
    if (secondDigit != Number(cpf[10]))
      throw new BadRequestException('CPF inválido');

    await this.throwIfItsUsed(cpf, 'cpf');
  }

  private async validateCNPJ(cnpj: string): Promise<void> {
    const digits = cnpj.split('').map((d) => Number(d));

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += digits[i] * weights1[i];

    let firstDigit = sum % 11;
    firstDigit = firstDigit < 2 ? 0 : 11 - firstDigit;
    if (firstDigit != digits[12])
      throw new BadRequestException('CNPJ inválido');

    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) sum += digits[i] * weights2[i];

    let secondDigit = sum % 11;
    secondDigit = secondDigit < 2 ? 0 : 11 - secondDigit;
    if (secondDigit != digits[13])
      throw new BadRequestException('CNPJ inválido');

    await this.throwIfItsUsed(cnpj, 'cnpj');
  }
}

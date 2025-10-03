import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserGateway } from "./user.gateway";
import { User } from "./entities/user.entity";
import { Message } from "../../shared/interfaces/messages";
import { AuthMessage } from "../../shared/interfaces/messages/auth";
import { AuthService } from "../../shared/modules/auth/auth.service";
import { EmailService } from "../../shared/modules/email/email.service";
import type { IUserRepository } from "./repositories/user.repository";

@Injectable()
export class UserService {
  public constructor(
    @Inject("IUserRepository") private readonly userRepository: IUserRepository,
    private readonly userGateway: UserGateway,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<AuthMessage> {
    await this.throwIfEmailIsUsed(createUserDto.email);
    createUserDto.password = await this.authService.hashPassword(
      createUserDto.password,
    );

    const result = await this.userRepository.create(createUserDto);
    const token = await this.authService.generateToken(result.id);

    await this.emailService.sendMail({
      to: result.email,
      subject: "VALIDAÇÃO DE CONTA",
      html: this.emailService.createValidationButton(token),
    });

    const user = result.toObject();
    delete user.password;

    return { message: "Usuário criado com sucesso", token, user };
  }

  public async login(loginUserDto: LoginUserDto): Promise<AuthMessage> {
    const result = await this.userRepository.findByEmail(loginUserDto.email);
    if (!result) throw new BadRequestException("Email incorreto");
    await this.authService.comparePassword(
      loginUserDto.password,
      result.password!,
    );

    const token = await this.authService.generateToken(result.id);
    const user = result.toObject();
    delete user.password;

    return { message: "Login realizado com sucesso", token, user };
  }

  public async decodeToken(token: string): Promise<User> {
    const id = await this.authService.decodeToken(token);
    const result = await this.findById(id);
    const user = result.toObject();
    delete user.password;
    return user;
  }

  public async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new BadRequestException("Usuário não encontrado");
    return user;
  }

  public async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Message> {
    const { email } = await this.findById(id);
    if (updateUserDto.isValid) delete updateUserDto.isValid;
    if (updateUserDto.password)
      updateUserDto.password = await this.authService.hashPassword(
        updateUserDto.password,
      );
    if (updateUserDto.email && updateUserDto.email != email) {
      await this.throwIfEmailIsUsed(updateUserDto.email);
      updateUserDto.isValid = false;
    }
    await this.userRepository.update(id, updateUserDto);
    return { message: "Usuário atualizado com sucesso" };
  }

  public async validateEmail(token: string): Promise<Message> {
    const { id, email } = await this.decodeToken(token);
    await this.userRepository.update(id, { isValid: true });
    this.userGateway.onEmailValidated(email);
    return { message: "Email validado com sucesso" };
  }

  public async delete(id: string): Promise<Message> {
    await this.findById(id);
    await this.userRepository.delete(id);
    return { message: "Usuário deletado com sucesso" };
  }

  private async throwIfEmailIsUsed(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (user) throw new BadRequestException("Esse email já está em uso");
  }
}

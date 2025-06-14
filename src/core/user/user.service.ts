import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserRepository } from "./repositories/user.repository";
import { AuthMessage } from "../../shared/interfaces/auth-message";
import { AuthService } from "../../shared/modules/auth/auth.service";
import { Message } from "../../shared/interfaces/message";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UtilsService } from "../../shared/utils/utils.service";
import { UserGateway } from "./user.gateway";

@Injectable()
export class UserService {
  public constructor(
    @Inject("UserRepository") private readonly userRepository: UserRepository,
    private readonly userGateway: UserGateway,
    private readonly authService: AuthService,
    private readonly utilsService: UtilsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<AuthMessage> {
    await this.throwIfEmailISUsed(createUserDto.email);

    createUserDto.password = await this.authService.hashPassword(
      createUserDto.password,
    );

    const user = await this.userRepository.create(createUserDto);

    const userObject = user.toObject();
    delete userObject.password;

    const token = await this.authService.generateToken(user.id);

    this.sendValidationEmail(user.email, token);

    return {
      message: "Conta criada com sucesso",
      user: userObject,
      token,
    };
  }

  public async login(loginUserDto: LoginUserDto): Promise<AuthMessage> {
    const user = await this.findByEmail(loginUserDto.email);

    await this.authService.comparePassword(
      loginUserDto.password,
      user.password,
    );

    const userObject = user.toObject();
    delete userObject.password;

    const token = await this.authService.generateToken(user.id);

    return {
      message: "Login realizado com sucesso",
      user: userObject,
      token,
    };
  }

  public async decodeToken(token: string): Promise<User> {
    const id = await this.authService.decodeToken(token);
    const user = await this.findById(id);
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  public async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return user;
  }

  public async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Message> {
    const { email } = await this.findById(id);

    if (updateUserDto.email && email != updateUserDto.email) {
      await this.throwIfEmailISUsed(updateUserDto.email);
      const token = await this.authService.generateToken(id);
      this.sendValidationEmail(updateUserDto.email, token);
      updateUserDto.isEmailValid = false;
    }

    if (updateUserDto.password)
      updateUserDto.password = await this.authService.hashPassword(
        updateUserDto.password,
      );

    return { message: "Dados da conta atualizados com sucesso" };
  }

  public async validateEmail(token: string): Promise<string> {
    const { _id, email, isEmailValid } = await this.decodeToken(token);

    if (isEmailValid)
      return this.utilsService.createAlertResponse("Sua conta já foi validada");

    await this.userRepository.update(_id, { isEmailValid: true });

    this.userGateway.validateEmail(email);

    return this.utilsService.createAlertResponse("Conta validada com sucesso");
  }

  public async delete(id: string): Promise<Message> {
    await this.findById(id);
    await this.userRepository.delete(id);
    return { message: "Conta removida com sucesso" };
  }

  private async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return user;
  }

  private async throwIfEmailISUsed(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (user)
      throw new BadRequestException("Esse email já está sendo utilizado");
  }

  private sendValidationEmail(email: string, token: string): void {
    this.eventEmitter.emit("email.send", {
      to: email,
      subject: "VALIDAÇÃO DE CONTA NO VOX",
      html: this.utilsService.createValidationButton(token),
    });
  }
}

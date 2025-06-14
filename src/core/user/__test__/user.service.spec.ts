import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../user.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AuthService } from "../../../shared/modules/auth/auth.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UtilsService } from "../../../shared/utils/utils.service";
import { UserGateway } from "../user.gateway";

const mockUser = {
  id: "123",
  email: "test@example.com",
  password: "hashedPassword",
  toObject: jest.fn().mockReturnValue({ id: "123", email: "test@example.com" }),
};

const mockToken = "mockToken";

const mockUserRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUserGateway = {
  validateEmail: jest.fn(),
};

const mockAuthService = {
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
  decodeToken: jest.fn(),
};

const mockUtilsService = {
  createAlertResponse: jest.fn(),
  createValidationButton: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

describe("UserService", () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: "UserRepository", useValue: mockUserRepository },
        { provide: UserGateway, useValue: mockUserGateway },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UtilsService, useValue: mockUtilsService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(userService).toBeDefined();
  });

  describe("create", () => {
    it("should create a new user and return AuthMessage", async () => {
      mockUtilsService.createValidationButton.mockReturnValue("mockedButton");
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockAuthService.hashPassword.mockResolvedValue("hashedPassword");
      mockAuthService.generateToken.mockResolvedValue(mockToken);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await userService.create({
        email: "test@example.com",
        name: "test",
        password: "password",
      });

      expect(result).toEqual({
        message: "Conta criada com sucesso",
        user: { id: "123", email: "test@example.com" },
        token: mockToken,
      });

      expect(mockAuthService.hashPassword).toHaveBeenCalledWith("password");
      expect(mockUserRepository.create).toHaveBeenCalled();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith("email.send", {
        to: "test@example.com",
        subject: "VALIDAÇÃO DE CONTA NO VOX",
        html: "mockedButton",
      });
    });

    it("should throw BadRequestException if email is already in use", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        userService.create({
          email: "test@example.com",
          name: "test",
          password: "password",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("login", () => {
    it("should log in a user and return AuthMessage", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockAuthService.generateToken.mockResolvedValue(mockToken);

      const result = await userService.login({
        email: "test@example.com",
        password: "password",
      });

      expect(result).toEqual({
        message: "Login realizado com sucesso",
        user: { id: "123", email: "test@example.com" },
        token: mockToken,
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("should throw NotFoundException if user is not found", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        userService.login({
          email: "notfound@example.com",
          password: "password",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if password is incorrect", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockAuthService.comparePassword.mockRejectedValue(
        new BadRequestException(),
      );

      await expect(
        userService.login({
          email: "test@example.com",
          password: "wrongPassword",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("decodeToken", () => {
    it("should return a user", async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockAuthService.decodeToken.mockResolvedValue("123");

      const result = await userService.decodeToken(mockToken);

      const mockUserWithoutPassword = { ...mockUser };
      delete mockUserWithoutPassword.password;
      delete mockUserWithoutPassword.toObject;

      expect(result).toEqual(mockUserWithoutPassword);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("123");
    });

    it("should throw NotFoundException if user is not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.decodeToken("notfound")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findById", () => {
    it("should return a user by id", async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findById("123");

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("123");
    });

    it("should throw NotFoundException if user is not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.findById("notfound")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update user data successfully", async () => {
      const anotherUser = {
        id: "123",
        email: "updated@example.com",
        password: "newPassword",
        toObject: jest
          .fn()
          .mockReturnValue({ id: "123", email: "updated@example.com" }),
      };

      mockUserRepository.update.mockResolvedValue(anotherUser);
      mockUtilsService.createValidationButton.mockReturnValue("mockedButton");
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockAuthService.hashPassword.mockResolvedValue("hashedPassword");
      mockAuthService.generateToken.mockResolvedValue(mockToken);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await userService.update("123", {
        email: "updated@example.com",
        password: "newPassword",
      });

      expect(result).toEqual({
        message: "Dados da conta atualizados com sucesso",
      });
      expect(mockAuthService.hashPassword).toHaveBeenCalledWith("newPassword");
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("email.send", {
        to: "updated@example.com",
        subject: "VALIDAÇÃO DE CONTA NO VOX",
        html: expect.any(String),
      });
    });

    it("should throw BadRequestException if email is already in use", async () => {
      const anotherUser = {
        id: "123",
        email: "test@example.com",
        password: "newPassword",
        toObject: jest
          .fn()
          .mockReturnValue({ id: "123", email: "test@example.com" }),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue(anotherUser);

      await expect(
        userService.update("123", {
          email: "test2@example.com",
          name: "test",
          password: "password",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if user is not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.update("notfound", {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("validateUser", () => {
    it("should validate the user email", async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockAuthService.decodeToken.mockResolvedValue("123");
      mockUtilsService.createAlertResponse.mockResolvedValue(
        "Conta validada com sucesso",
      );

      const result = await userService.validateEmail(mockToken);

      expect(result).toEqual("Conta validada com sucesso");
      expect(mockUserRepository.findById).toHaveBeenCalledWith("123");
    });

    it("should not validate the user email", async () => {
      mockUserRepository.findById.mockResolvedValue({
        ...mockUser,
        isEmailValid: true,
      });
      mockAuthService.decodeToken.mockResolvedValue("123");
      mockUtilsService.createAlertResponse.mockResolvedValue(
        "Sua conta já foi validada",
      );

      const result = await userService.validateEmail(mockToken);

      expect(result).toEqual("Sua conta já foi validada");
      expect(mockUserRepository.findById).toHaveBeenCalledWith("123");
    });
  });

  describe("delete", () => {
    it("should delete a user by id and return a success message", async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      const result = await userService.delete("123");

      expect(result).toEqual({ message: "Conta removida com sucesso" });
      expect(mockUserRepository.delete).toHaveBeenCalledWith("123");
    });

    it("should throw NotFoundException if user is not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.delete("notfound")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

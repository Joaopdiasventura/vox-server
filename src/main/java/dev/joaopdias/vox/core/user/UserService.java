package dev.joaopdias.vox.core.user;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import dev.joaopdias.vox.core.user.dto.AuthResponseDto;
import dev.joaopdias.vox.core.user.dto.CreateUserDto;
import dev.joaopdias.vox.core.user.dto.LoginUserDto;
import dev.joaopdias.vox.core.user.dto.UpdateUserDto;
import dev.joaopdias.vox.core.user.entities.User;
import dev.joaopdias.vox.shared.services.MailService;
import dev.joaopdias.vox.shared.services.SecurityService;

@Service
public class UserService {
    private final UserRepository userRepository;

    private final SecurityService securityService;

    private final MailService mailService;

    public UserService(
        UserRepository userRepository,
        SecurityService securityService,
        MailService mailService
    ){
        this.userRepository = userRepository;
        this.securityService = securityService;
        this.mailService = mailService;
    }

    public String create(CreateUserDto createUserDto){
        validateEmail(createUserDto.email());

        String hashedPassword = securityService.hashPassword(createUserDto.password());

        User user = new User();

        user.setEmail(createUserDto.email());
        user.setName(createUserDto.name());
        user.setPassword(hashedPassword);

        userRepository.save(user);

        String token = securityService.createJwt(user.getId());

        mailService.sendAccountValidationEmail(user.getEmail(), token);

        return "Valide a conta do usuário. Enviamos um email com um link de validação.";
    }

    public AuthResponseDto login(LoginUserDto loginUserDto) {
        User user = userRepository.findByEmail(loginUserDto.email());

        if (user == null || !securityService.matchesPassword(loginUserDto.password(), user.getPassword()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");

        if (!user.getIsValidated())
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta não validada. Verifique seu email para validar a conta.");

        String token = securityService.createJwt(user.getId());

        AuthResponseDto response = new AuthResponseDto(
            token,
            user.toResponseDto()
        );

        return response;
    }

    public AuthResponseDto decodeToken(UUID id) {
        User user = findById(id);

        if (!user.getIsValidated())
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta não validada. Verifique seu email para validar a conta.");

        String newToken = securityService.createJwt(user.getId());

        return new AuthResponseDto(newToken, user.toResponseDto());
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada"));
    }

    public void update(UUID id, UpdateUserDto updateUserDto) {
        User user = findById(id);

        if (updateUserDto.email() != null && !updateUserDto.email().equals(user.getEmail())) {
            validateEmail(updateUserDto.email());
            user.setEmail(updateUserDto.email());
            user.setIsValidated(false);
            String token = securityService.createJwt(user.getId());
            mailService.sendAccountValidationEmail(user.getEmail(), token);
        }

        if (updateUserDto.name() != null) 
            user.setName(updateUserDto.name());

        if (updateUserDto.password() != null) 
            user.setPassword(securityService.hashPassword(updateUserDto.password()));

        userRepository.save(user);
    }

    public AuthResponseDto validateAccount(String token) {
        UUID id = securityService.decodeJwt(token);
        User user = findById(id);

        if (user.getIsValidated())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conta já validada");

        user.setIsValidated(true);
        userRepository.save(user);

        String newToken = securityService.createJwt(user.getId());

        return new AuthResponseDto(newToken, user.toResponseDto());
    }

    public void resetPassword(String email) {
        User user = userRepository.findByEmail(email);

        if (user == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada");

        String temporaryPassword = securityService.generateRandomWord(16);
        user.setPassword(securityService.hashPassword(temporaryPassword));
        userRepository.save(user);

        mailService.sendTemporaryPasswordEmail(user.getEmail(), temporaryPassword);
    }

    public void delete(UUID id) {
        User user = findById(id);
        userRepository.delete(user);
    }

    private void validateEmail(String email) {
        if (userRepository.findByEmail(email) != null) 
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já cadastrado");
    }
}

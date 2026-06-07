package dev.joaopdias.vox.core.user;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import dev.joaopdias.vox.core.user.dto.AuthResponseDto;
import dev.joaopdias.vox.core.user.dto.CreateUserDto;
import dev.joaopdias.vox.core.user.dto.LoginUserDto;
import dev.joaopdias.vox.core.user.dto.UpdateUserDto;
import dev.joaopdias.vox.core.user.entities.User;
import dev.joaopdias.vox.shared.services.MailService;
import dev.joaopdias.vox.shared.services.SecurityService;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    private static final Instant CREATED_AT = Instant.parse("2026-01-01T00:00:00Z");

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityService securityService;

    @Mock
    private MailService mailService;

    private UserService service;

    @BeforeEach
    void setUp() {
        service = new UserService();
        ReflectionTestUtils.setField(service, "userRepository", userRepository);
        ReflectionTestUtils.setField(service, "securityService", securityService);
        ReflectionTestUtils.setField(service, "mailService", mailService);
    }

    @Test
    void createPersistsUserWithHashedPasswordAndSendsValidationEmail() {
        UUID id = UUID.randomUUID();
        CreateUserDto request = new CreateUserDto("ana@example.com", "Ana", "SenhaForte1!");
        when(userRepository.findByEmail(request.email())).thenReturn(null);
        when(securityService.hashPassword(request.password())).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(id);
            user.setCreatedAt(CREATED_AT);
            user.setIsValidated(false);
            return user;
        });
        when(securityService.createJwt(id)).thenReturn("created-jwt");

        String response = service.create(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getEmail()).isEqualTo(request.email());
        assertThat(savedUser.getName()).isEqualTo(request.name());
        assertThat(savedUser.getPassword()).isEqualTo("hashed-password");
        assertThat(response).isEqualTo("Valide a conta do usuário. Enviamos um email com um link de validação.");
        verify(mailService).sendAccountValidationEmail(request.email(), "created-jwt");
    }

    @Test
    void createRejectsDuplicatedEmail() {
        CreateUserDto request = new CreateUserDto("ana@example.com", "Ana", "SenhaForte1!");
        when(userRepository.findByEmail(request.email())).thenReturn(user(UUID.randomUUID()));

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                assertThat(exception.getReason()).isEqualTo("Email já cadastrado");
            });

        verifyNoInteractions(securityService);
        verifyNoInteractions(mailService);
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginReturnsTokenWhenCredentialsMatch() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        LoginUserDto request = new LoginUserDto(user.getEmail(), "SenhaForte1!");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(user);
        when(securityService.matchesPassword(request.password(), user.getPassword())).thenReturn(true);
        when(securityService.createJwt(id)).thenReturn("login-jwt");

        AuthResponseDto response = service.login(request);

        assertThat(response.user().id()).isEqualTo(id);
        assertThat(response.token()).isEqualTo("login-jwt");
        assertThat(response.user().email()).isEqualTo(user.getEmail());
        assertThat(response.user().name()).isEqualTo(user.getName());
    }

    @Test
    void loginRejectsMissingUserWithoutCheckingPassword() {
        LoginUserDto request = new LoginUserDto("missing@example.com", "SenhaForte1!");
        when(userRepository.findByEmail(request.email())).thenReturn(null);

        assertThatThrownBy(() -> service.login(request))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                assertThat(exception.getReason()).isEqualTo("E-mail ou senha inválidos");
            });

        verify(securityService, never()).matchesPassword(any(), any());
        verify(securityService, never()).createJwt(any());
    }

    @Test
    void loginRejectsInvalidCredentials() {
        User user = user(UUID.randomUUID());
        LoginUserDto request = new LoginUserDto(user.getEmail(), "SenhaErrada1!");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(user);
        when(securityService.matchesPassword(request.password(), user.getPassword())).thenReturn(false);

        assertThatThrownBy(() -> service.login(request))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                assertThat(exception.getReason()).isEqualTo("E-mail ou senha inválidos");
            });

        verify(securityService, never()).createJwt(any());
    }

    @Test
    void loginRejectsUnvalidatedUser() {
        User user = user(UUID.randomUUID());
        user.setIsValidated(false);
        LoginUserDto request = new LoginUserDto(user.getEmail(), "SenhaForte1!");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(user);
        when(securityService.matchesPassword(request.password(), user.getPassword())).thenReturn(true);

        assertThatThrownBy(() -> service.login(request))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                assertThat(exception.getReason()).isEqualTo("Conta não validada. Verifique seu email para validar a conta.");
            });

        verify(securityService, never()).createJwt(any());
    }

    @Test
    void decodeTokenLoadsUserAndRefreshesToken() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(securityService.createJwt(id)).thenReturn("new-jwt");

        AuthResponseDto response = service.decodeToken(id);

        assertThat(response.token()).isEqualTo("new-jwt");
        assertThat(response.user().id()).isEqualTo(id);
        assertThat(response.user().email()).isEqualTo(user.getEmail());
    }

    @Test
    void decodeTokenRejectsUnvalidatedUser() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        user.setIsValidated(false);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.decodeToken(id))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                assertThat(exception.getReason()).isEqualTo("Conta não validada. Verifique seu email para validar a conta.");
            });

        verify(securityService, never()).createJwt(any());
    }

    @Test
    void findByIdRejectsMissingUser() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(id))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                assertThat(exception.getReason()).isEqualTo("Conta não encontrada");
            });
    }

    @Test
    void updateChangesProvidedFieldsAndRevalidatesChangedEmail() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        UpdateUserDto request = new UpdateUserDto("ana.nova@example.com", "Ana Nova", "NovaSenha1!");
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.findByEmail(request.email())).thenReturn(null);
        when(securityService.hashPassword(request.password())).thenReturn("new-hashed-password");
        when(securityService.createJwt(id)).thenReturn("validation-jwt");

        service.update(id, request);

        assertThat(user.getId()).isEqualTo(id);
        assertThat(user.getEmail()).isEqualTo(request.email());
        assertThat(user.getName()).isEqualTo(request.name());
        assertThat(user.getPassword()).isEqualTo("new-hashed-password");
        assertThat(user.getIsValidated()).isFalse();
        verify(mailService).sendAccountValidationEmail(request.email(), "validation-jwt");
        verify(userRepository).save(user);
    }

    @Test
    void updateChangesNameOnlyWithoutRevalidation() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        UpdateUserDto request = new UpdateUserDto(null, "Ana Nova", null);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        service.update(id, request);

        assertThat(user.getEmail()).isEqualTo("ana@example.com");
        assertThat(user.getName()).isEqualTo("Ana Nova");
        assertThat(user.getPassword()).isEqualTo("hashed-password");
        assertThat(user.getIsValidated()).isTrue();
        verifyNoInteractions(securityService);
        verifyNoInteractions(mailService);
        verify(userRepository).save(user);
    }

    @Test
    void updateChangesPasswordOnlyWithHash() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        UpdateUserDto request = new UpdateUserDto(null, null, "NovaSenha1!");
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(securityService.hashPassword(request.password())).thenReturn("new-hashed-password");

        service.update(id, request);

        assertThat(user.getEmail()).isEqualTo("ana@example.com");
        assertThat(user.getName()).isEqualTo("Ana");
        assertThat(user.getPassword()).isEqualTo("new-hashed-password");
        assertThat(user.getIsValidated()).isTrue();
        verify(mailService, never()).sendAccountValidationEmail(any(), any());
        verify(securityService, never()).createJwt(any());
        verify(userRepository).save(user);
    }

    @Test
    void updateKeepsEmailWhenSameValueIsProvided() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        UpdateUserDto request = new UpdateUserDto(user.getEmail(), null, null);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        service.update(id, request);

        verify(userRepository, never()).findByEmail(user.getEmail());
        verify(securityService, never()).hashPassword(any());
        verify(securityService, never()).createJwt(any());
        verifyNoInteractions(mailService);
        verify(userRepository).save(user);
    }

    @Test
    void updateRejectsDuplicatedEmailBeforeSaving() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        User otherUser = user(UUID.randomUUID());
        UpdateUserDto request = new UpdateUserDto("duplicated@example.com", null, null);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.findByEmail(request.email())).thenReturn(otherUser);

        assertThatThrownBy(() -> service.update(id, request))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                assertThat(exception.getReason()).isEqualTo("Email já cadastrado");
            });

        verify(securityService, never()).createJwt(any());
        verifyNoInteractions(mailService);
        verify(userRepository, never()).save(any());
    }

    @Test
    void validateAccountMarksUserAsValidatedAndReturnsNewToken() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        user.setIsValidated(false);
        when(securityService.decodeJwt("validation-jwt")).thenReturn(id);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(securityService.createJwt(id)).thenReturn("new-jwt");

        AuthResponseDto response = service.validateAccount("validation-jwt");

        assertThat(user.getIsValidated()).isTrue();
        assertThat(response.token()).isEqualTo("new-jwt");
        assertThat(response.user().id()).isEqualTo(id);
        verify(userRepository).save(user);
    }

    @Test
    void validateAccountRejectsAlreadyValidatedUser() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        when(securityService.decodeJwt("validation-jwt")).thenReturn(id);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.validateAccount("validation-jwt"))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                assertThat(exception.getReason()).isEqualTo("Conta já validada");
            });

        verify(securityService, never()).createJwt(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPasswordStoresTemporaryPasswordAndSendsEmail() {
        User user = user(UUID.randomUUID());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(user);
        when(securityService.generateRandomWord(16)).thenReturn("Temporaria1!");
        when(securityService.hashPassword("Temporaria1!")).thenReturn("temporary-hash");

        service.resetPassword(user.getEmail());

        assertThat(user.getPassword()).isEqualTo("temporary-hash");
        verify(userRepository).save(user);
        verify(mailService).sendTemporaryPasswordEmail(user.getEmail(), "Temporaria1!");
    }

    @Test
    void resetPasswordRejectsMissingUser() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(null);

        assertThatThrownBy(() -> service.resetPassword("missing@example.com"))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                assertThat(exception.getReason()).isEqualTo("Conta não encontrada");
            });

        verifyNoInteractions(securityService);
        verifyNoInteractions(mailService);
        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteRemovesExistingUser() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        service.delete(id);

        verify(userRepository).delete(user);
    }

    private static User user(UUID id) {
        User user = new User();
        user.setId(id);
        user.setEmail("ana@example.com");
        user.setName("Ana");
        user.setPassword("hashed-password");
        user.setCreatedAt(CREATED_AT);
        user.setIsValidated(true);
        return user;
    }
}

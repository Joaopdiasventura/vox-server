package dev.joaopdias.vox.core.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import dev.joaopdias.vox.core.user.dto.AuthResponseDto;
import dev.joaopdias.vox.core.user.dto.CreateUserDto;
import dev.joaopdias.vox.core.user.dto.LoginUserDto;
import dev.joaopdias.vox.core.user.dto.UpdateUserDto;
import dev.joaopdias.vox.core.user.entities.User;
import dev.joaopdias.vox.shared.services.SecurityService;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    private static final Instant CREATED_AT = Instant.parse("2026-01-01T00:00:00Z");

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityService securityService;

    private UserService service;

    @BeforeEach
    void setUp() {
        service = new UserService();
        ReflectionTestUtils.setField(service, "userRepository", userRepository);
        ReflectionTestUtils.setField(service, "securityService", securityService);
    }

    @Test
    void createPersistsUserWithHashedPasswordAndReturnsToken() {
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

        AuthResponseDto response = service.create(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getEmail()).isEqualTo(request.email());
        assertThat(savedUser.getName()).isEqualTo(request.name());
        assertThat(savedUser.getPassword()).isEqualTo("hashed-password");
        assertThat(response.token()).isEqualTo("created-jwt");
        assertThat(response.user().email()).isEqualTo(request.email());
        assertThat(response.user().name()).isEqualTo(request.name());
        assertThat(response.user().createdAt()).isEqualTo(CREATED_AT);
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

        assertThat(response.token()).isEqualTo("login-jwt");
        assertThat(response.user().email()).isEqualTo(user.getEmail());
        assertThat(response.user().name()).isEqualTo(user.getName());
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
    void decodeTokenLoadsUserAndRefreshesToken() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        when(securityService.decodeJwt("old-jwt")).thenReturn(id);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(securityService.createJwt(id)).thenReturn("new-jwt");

        AuthResponseDto response = service.decodeToken("old-jwt");

        assertThat(response.token()).isEqualTo("new-jwt");
        assertThat(response.user().email()).isEqualTo(user.getEmail());
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
    void updateChangesOnlyProvidedFieldsAndHashesPassword() {
        UUID id = UUID.randomUUID();
        User user = user(id);
        UpdateUserDto request = new UpdateUserDto("ana.nova@example.com", "Ana Nova", "NovaSenha1!");
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.findByEmail(request.email())).thenReturn(null);
        when(securityService.hashPassword(request.password())).thenReturn("new-hashed-password");

        service.update(id, request);

        assertThat(user.getEmail()).isEqualTo(request.email());
        assertThat(user.getName()).isEqualTo(request.name());
        assertThat(user.getPassword()).isEqualTo("new-hashed-password");
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
        verify(userRepository).save(user);
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
        user.setIsValidated(false);
        return user;
    }
}

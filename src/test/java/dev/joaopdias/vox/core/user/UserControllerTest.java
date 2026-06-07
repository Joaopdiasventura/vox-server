package dev.joaopdias.vox.core.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import dev.joaopdias.vox.core.user.dto.AuthResponseDto;
import dev.joaopdias.vox.core.user.dto.CreateUserDto;
import dev.joaopdias.vox.core.user.dto.LoginUserDto;
import dev.joaopdias.vox.core.user.dto.UpdateUserDto;
import dev.joaopdias.vox.core.user.dto.UserResponseDto;
import dev.joaopdias.vox.shared.security.AuthenticatedUser;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {
    @Mock
    private UserService userService;

    private UserController controller;

    @BeforeEach
    void setUp() {
        controller = new UserController(120);
        ReflectionTestUtils.setField(controller, "userService", userService);
        ReflectionTestUtils.setField(controller, "secureCookie", true);
        ReflectionTestUtils.setField(controller, "cookieSameSite", "Lax");
    }

    @Test
    void createReturnsValidationMessage() {
        CreateUserDto request = new CreateUserDto("ana@example.com", "Ana", "SenhaForte1!");
        MockHttpServletResponse response = new MockHttpServletResponse();
        String message = "Valide a conta do usuário. Enviamos um email com um link de validação.";
        when(userService.create(request)).thenReturn(message);

        String result = controller.create(request, response);

        assertThat(result).isEqualTo(message);
        assertThat(response.getHeader("Set-Cookie")).isNull();
    }

    @Test
    void loginReturnsUserAndAddsAuthCookie() {
        LoginUserDto request = new LoginUserDto("ana@example.com", "SenhaForte1!");
        UserResponseDto user = userResponse();
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(userService.login(request)).thenReturn(new AuthResponseDto("login-jwt", user));

        UserResponseDto result = controller.login(request, response);

        assertThat(result).isEqualTo(user);
        assertAuthCookie(response, "login-jwt");
    }

    @Test
    void logoutExpiresAuthCookie() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        controller.logout(response);

        assertThat(response.getHeader("Set-Cookie"))
            .contains("Authorization=")
            .contains("Path=/")
            .contains("Max-Age=0")
            .contains("HttpOnly")
            .contains("Secure")
            .contains("SameSite=Lax");
    }

    @Test
    void decodeTokenReturnsUserAndRefreshesAuthCookie() {
        UUID id = UUID.randomUUID();
        UserResponseDto user = userResponse();
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(userService.decodeToken(id)).thenReturn(new AuthResponseDto("refreshed-jwt", user));

        UserResponseDto result = controller.decodeToken(new AuthenticatedUser(id), response);

        assertThat(result).isEqualTo(user);
        assertAuthCookie(response, "refreshed-jwt");
    }

    @Test
    void decodeTokenRejectsMissingAuthentication() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertThatThrownBy(() -> controller.decodeToken(null, response))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                assertThat(exception.getReason()).isEqualTo("Faça login novamente.");
            });
    }

    @Test
    void validateAccountReturnsUserAndAddsAuthCookie() {
        UserResponseDto user = userResponse();
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(userService.validateAccount("validation-jwt")).thenReturn(new AuthResponseDto("new-jwt", user));

        UserResponseDto result = controller.validateAccount("validation-jwt", response);

        assertThat(result).isEqualTo(user);
        assertAuthCookie(response, "new-jwt");
    }

    @Test
    void resetPasswordDelegatesToServiceUsingEmail() {
        controller.resetPassword("ana@example.com");

        verify(userService).resetPassword("ana@example.com");
    }

    @Test
    void updateDelegatesToServiceUsingAuthenticatedUserId() {
        UUID id = UUID.randomUUID();
        UpdateUserDto request = new UpdateUserDto("ana.nova@example.com", "Ana Nova", "NovaSenha1!");

        controller.update(new AuthenticatedUser(id), request);

        verify(userService).update(id, request);
    }

    @Test
    void deleteDelegatesToServiceUsingAuthenticatedUserId() {
        UUID id = UUID.randomUUID();

        controller.delete(new AuthenticatedUser(id));

        verify(userService).delete(id);
    }

    private static void assertAuthCookie(MockHttpServletResponse response, String token) {
        assertThat(response.getHeader("Set-Cookie"))
            .contains("Authorization=" + token)
            .contains("Path=/")
            .contains("Max-Age=7200")
            .contains("HttpOnly")
            .contains("Secure")
            .contains("SameSite=Lax");
    }

    private static UserResponseDto userResponse() {
        return new UserResponseDto(UUID.randomUUID(), "ana@example.com", "Ana", Instant.parse("2026-01-01T00:00:00Z"));
    }
}

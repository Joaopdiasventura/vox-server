package dev.joaopdias.vox.core.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

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
        controller = new UserController();
        ReflectionTestUtils.setField(controller, "userService", userService);
        ReflectionTestUtils.setField(controller, "secureCookie", true);
        ReflectionTestUtils.setField(controller, "cookieSameSite", "Lax");
    }

    @Test
    void createReturnsUserAndAddsAuthCookie() {
        CreateUserDto request = new CreateUserDto("ana@example.com", "Ana", "SenhaForte1!");
        UserResponseDto user = userResponse();
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(userService.create(request)).thenReturn(new AuthResponseDto("new-jwt", user));

        UserResponseDto result = controller.create(request, response);

        assertThat(result).isEqualTo(user);
        assertThat(response.getHeader("Set-Cookie"))
            .contains("access_token=new-jwt")
            .contains("Path=/")
            .contains("Max-Age=7200")
            .contains("HttpOnly")
            .contains("Secure")
            .contains("SameSite=Lax");
    }

    @Test
    void loginReturnsUserAndAddsAuthCookie() {
        LoginUserDto request = new LoginUserDto("ana@example.com", "SenhaForte1!");
        UserResponseDto user = userResponse();
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(userService.login(request)).thenReturn(new AuthResponseDto("login-jwt", user));

        UserResponseDto result = controller.login(request, response);

        assertThat(result).isEqualTo(user);
        assertThat(response.getHeader("Set-Cookie")).contains("access_token=login-jwt");
    }

    @Test
    void logoutExpiresAuthCookie() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        controller.logout(response);

        assertThat(response.getHeader("Set-Cookie"))
            .contains("access_token=")
            .contains("Path=/")
            .contains("Max-Age=0")
            .contains("HttpOnly")
            .contains("Secure")
            .contains("SameSite=Lax");
    }

    @Test
    void decodeTokenReturnsUserAndRefreshesAuthCookie() {
        UserResponseDto user = userResponse();
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(userService.decodeToken("old-jwt")).thenReturn(new AuthResponseDto("refreshed-jwt", user));

        UserResponseDto result = controller.decodeToken("old-jwt", response);

        assertThat(result).isEqualTo(user);
        assertThat(response.getHeader("Set-Cookie")).contains("access_token=refreshed-jwt");
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

        controller.update(new AuthenticatedUser(id));

        verify(userService).delete(id);
    }

    private static UserResponseDto userResponse() {
        return new UserResponseDto("ana@example.com", "Ana", Instant.parse("2026-01-01T00:00:00Z"));
    }
}

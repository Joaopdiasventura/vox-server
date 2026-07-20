package dev.joaopdias.vox.core.user;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import dev.joaopdias.vox.core.user.dto.AuthResponseDto;
import dev.joaopdias.vox.core.user.dto.CreateUserDto;
import dev.joaopdias.vox.core.user.dto.LoginUserDto;
import dev.joaopdias.vox.core.user.dto.UpdateUserDto;
import dev.joaopdias.vox.core.user.dto.UserResponseDto;
import dev.joaopdias.vox.shared.security.AuthenticatedUser;
import dev.joaopdias.vox.shared.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @Value("${security.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${security.cookie.same-site:Strict}")
    private String cookieSameSite;

    private final Duration jwtExpiresIn;

    public UserController(
        UserService userService,
        @Value("${security.jwt.expires-in-minutes}") long jwtExpiresInMinutes
    ) {
        this.userService = userService;
        this.jwtExpiresIn = Duration.ofMinutes(jwtExpiresInMinutes);
    }

    @PostMapping()
    public String create(
        @RequestBody @Valid CreateUserDto createUserDto,
        HttpServletResponse response
    ) {
        return userService.create(createUserDto);
    }

    @PostMapping("/login")
    public UserResponseDto login(
        @RequestBody @Valid LoginUserDto loginUserDto,
        HttpServletResponse response
    ) {
        AuthResponseDto authResponseDto = userService.login(loginUserDto);
        setCookie(authResponseDto.token(), response);
        return authResponseDto.user();
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(JwtAuthFilter.getAuthorizationCookieName(), "")
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite(cookieSameSite)
            .path("/")
            .maxAge(0)
            .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    @GetMapping()
    public UserResponseDto decodeToken(
        @AuthenticationPrincipal AuthenticatedUser authentication,
        HttpServletResponse response
    ) {
        if (authentication == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Faça login novamente.");

        AuthResponseDto authResponseDto = userService.decodeToken(authentication.id());
        setCookie(authResponseDto.token(), response);
        return authResponseDto.user();
    }

    @PatchMapping()
    public void update(
        @AuthenticationPrincipal AuthenticatedUser authentication,
        @RequestBody @Valid UpdateUserDto updateUserDto
    ) {
        userService.update(authentication.id(), updateUserDto);
    }

    @PatchMapping("validate-account")
    public UserResponseDto validateAccount(
        @RequestParam String token,
        HttpServletResponse response
    ) {
        AuthResponseDto authResponseDto = userService.validateAccount(token);
        setCookie(authResponseDto.token(), response);
        return authResponseDto.user();
    }

    @PatchMapping("reset-password")
    public void resetPassword(@RequestParam String email) {
        userService.resetPassword(email);
    }

    @DeleteMapping()
    public void delete(@AuthenticationPrincipal AuthenticatedUser authentication) {
        userService.delete(authentication.id());
    }

    private void setCookie(String token, HttpServletResponse response){
        ResponseCookie cookie = ResponseCookie.from(JwtAuthFilter.getAuthorizationCookieName(), token)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite(cookieSameSite)
            .path("/")
            .maxAge(jwtExpiresIn)
            .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }
}

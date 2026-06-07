package dev.joaopdias.vox.shared.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import dev.joaopdias.vox.shared.services.SecurityService;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {
    @Mock
    private SecurityService securityService;

    private JwtAuthFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthFilter();
        ReflectionTestUtils.setField(filter, "securityService", securityService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void continuesWithoutAuthenticationWhenTokenCookieIsMissing() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean(false);
        FilterChain chain = (servletRequest, servletResponse) -> continued.set(true);

        filter.doFilter(request, response, chain);

        assertThat(continued).isTrue();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(securityService, never()).decodeJwt(any());
    }

    @Test
    void authenticatesRequestWhenTokenCookieIsValid() throws Exception {
        UUID id = UUID.randomUUID();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("Authorization", "valid-jwt"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean(false);
        FilterChain chain = (servletRequest, servletResponse) -> continued.set(true);
        when(securityService.decodeJwt("valid-jwt")).thenReturn(id);

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(continued).isTrue();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(new AuthenticatedUser(id));
    }

    @Test
    void authenticatesRequestWhenBearerTokenIsValid() throws Exception {
        UUID id = UUID.randomUUID();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-jwt");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean(false);
        FilterChain chain = (servletRequest, servletResponse) -> continued.set(true);
        when(securityService.decodeJwt("valid-jwt")).thenReturn(id);

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(continued).isTrue();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(new AuthenticatedUser(id));
    }

    @Test
    void authenticatesRequestWhenRawAuthorizationTokenIsValid() throws Exception {
        UUID id = UUID.randomUUID();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "  valid-jwt  ");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean(false);
        FilterChain chain = (servletRequest, servletResponse) -> continued.set(true);
        when(securityService.decodeJwt("valid-jwt")).thenReturn(id);

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(continued).isTrue();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(new AuthenticatedUser(id));
    }

    @Test
    void authenticatesRequestWhenAccessTokenHeaderIsValid() throws Exception {
        UUID id = UUID.randomUUID();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Access_token", "valid-jwt");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean(false);
        FilterChain chain = (servletRequest, servletResponse) -> continued.set(true);
        when(securityService.decodeJwt("valid-jwt")).thenReturn(id);

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(continued).isTrue();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(new AuthenticatedUser(id));
    }

    @Test
    void authenticatesRequestWhenHyphenatedAccessTokenHeaderIsValid() throws Exception {
        UUID id = UUID.randomUUID();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Access-Token", "valid-jwt");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean(false);
        FilterChain chain = (servletRequest, servletResponse) -> continued.set(true);
        when(securityService.decodeJwt("valid-jwt")).thenReturn(id);

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(continued).isTrue();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(new AuthenticatedUser(id));
    }

    @Test
    void prefersAuthorizationCookieOverHeaders() throws Exception {
        UUID id = UUID.randomUUID();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("Authorization", "cookie-jwt"));
        request.addHeader("Authorization", "Bearer header-jwt");
        request.addHeader("Access_token", "access-token-jwt");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean(false);
        FilterChain chain = (servletRequest, servletResponse) -> continued.set(true);
        when(securityService.decodeJwt("cookie-jwt")).thenReturn(id);

        filter.doFilter(request, response, chain);

        assertThat(continued).isTrue();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        verify(securityService).decodeJwt("cookie-jwt");
        verify(securityService, never()).decodeJwt("header-jwt");
        verify(securityService, never()).decodeJwt("access-token-jwt");
    }

    @Test
    void rejectsRequestAndClearsCookieWhenTokenIsInvalid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("Authorization", "invalid-jwt"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean(false);
        FilterChain chain = (servletRequest, servletResponse) -> continued.set(true);
        when(securityService.decodeJwt("invalid-jwt")).thenThrow(new IllegalArgumentException("invalid"));

        filter.doFilter(request, response, chain);

        assertThat(continued).isFalse();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(response.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(response.getContentAsString()).isEqualTo("{\"message\":\"Faça login novamente.\"}");
        assertThat(response.getHeader("Set-Cookie"))
            .contains("Authorization=")
            .contains("Path=/")
            .contains("Max-Age=0")
            .contains("HttpOnly");
    }

    @Test
    void skipsOptionsAndPublicUserEndpoints() throws Exception {
        MockHttpServletRequest optionsRequest = new MockHttpServletRequest(HttpMethod.OPTIONS.name(), "/anything");
        optionsRequest.setServletPath("/anything");
        MockHttpServletRequest healthRequest = new MockHttpServletRequest(HttpMethod.GET.name(), "/actuator/health");
        healthRequest.setServletPath("/actuator/health");
        MockHttpServletRequest createUserRequest = new MockHttpServletRequest(HttpMethod.POST.name(), "/user");
        createUserRequest.setServletPath("/user");
        MockHttpServletRequest loginRequest = new MockHttpServletRequest(HttpMethod.POST.name(), "/user/login");
        loginRequest.setServletPath("/user/login");
        MockHttpServletRequest logoutRequest = new MockHttpServletRequest(HttpMethod.POST.name(), "/user/logout");
        logoutRequest.setServletPath("/user/logout");
        MockHttpServletRequest validateAccountRequest = new MockHttpServletRequest(HttpMethod.PATCH.name(), "/user/validate-account");
        validateAccountRequest.setServletPath("/user/validate-account");
        MockHttpServletRequest resetPasswordRequest = new MockHttpServletRequest(HttpMethod.PATCH.name(), "/user/reset-password");
        resetPasswordRequest.setServletPath("/user/reset-password");
        MockHttpServletRequest errorRequest = new MockHttpServletRequest(HttpMethod.GET.name(), "/error");
        errorRequest.setServletPath("/error");
        errorRequest.setDispatcherType(DispatcherType.ERROR);
        MockHttpServletRequest privateRequest = new MockHttpServletRequest(HttpMethod.GET.name(), "/user");
        privateRequest.setServletPath("/user");

        assertThat(filter.shouldNotFilter(optionsRequest)).isTrue();
        assertThat(filter.shouldNotFilter(healthRequest)).isTrue();
        assertThat(filter.shouldNotFilter(createUserRequest)).isTrue();
        assertThat(filter.shouldNotFilter(loginRequest)).isTrue();
        assertThat(filter.shouldNotFilter(logoutRequest)).isTrue();
        assertThat(filter.shouldNotFilter(validateAccountRequest)).isTrue();
        assertThat(filter.shouldNotFilter(resetPasswordRequest)).isTrue();
        assertThat(filter.shouldNotFilter(errorRequest)).isTrue();
        assertThat(filter.shouldNotFilter(privateRequest)).isFalse();
    }

    @Test
    void normalizesContextPathAndTrailingSlashWhenSkippingPublicEndpoint() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(HttpMethod.POST.name(), "/api/user/login/");
        request.setContextPath("/api");
        request.setServletPath("/user/login/");

        assertThat(filter.shouldNotFilter(request)).isTrue();
    }
}

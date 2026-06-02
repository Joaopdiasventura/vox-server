package dev.joaopdias.vox.shared.security;

import static org.assertj.core.api.Assertions.assertThat;
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
        verify(securityService, never()).decodeJwt("access_token");
    }

    @Test
    void authenticatesRequestWhenTokenCookieIsValid() throws Exception {
        UUID id = UUID.randomUUID();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("access_token", "valid-jwt"));
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
    void rejectsRequestAndClearsCookieWhenTokenIsInvalid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("access_token", "invalid-jwt"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean(false);
        FilterChain chain = (servletRequest, servletResponse) -> continued.set(true);
        when(securityService.decodeJwt("invalid-jwt")).thenThrow(new IllegalArgumentException("invalid"));

        filter.doFilter(request, response, chain);

        assertThat(continued).isFalse();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(response.getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
        assertThat(response.getContentAsString()).isEqualTo("{\"message\":\"Faça login novamente.\"}");
        assertThat(response.getHeader("Set-Cookie"))
            .contains("access_token=")
            .contains("Path=/")
            .contains("Max-Age=0")
            .contains("HttpOnly");
    }

    @Test
    void skipsOptionsAndPublicUserEndpoints() throws Exception {
        MockHttpServletRequest optionsRequest = new MockHttpServletRequest(HttpMethod.OPTIONS.name(), "/anything");
        optionsRequest.setServletPath("/anything");
        MockHttpServletRequest createUserRequest = new MockHttpServletRequest(HttpMethod.POST.name(), "/user");
        createUserRequest.setServletPath("/user");
        MockHttpServletRequest loginRequest = new MockHttpServletRequest(HttpMethod.POST.name(), "/user/login");
        loginRequest.setServletPath("/user/login");
        MockHttpServletRequest logoutRequest = new MockHttpServletRequest(HttpMethod.POST.name(), "/user/logout");
        logoutRequest.setServletPath("/user/logout");
        MockHttpServletRequest privateRequest = new MockHttpServletRequest(HttpMethod.GET.name(), "/user");
        privateRequest.setServletPath("/user");

        assertThat(filter.shouldNotFilter(optionsRequest)).isTrue();
        assertThat(filter.shouldNotFilter(createUserRequest)).isTrue();
        assertThat(filter.shouldNotFilter(loginRequest)).isTrue();
        assertThat(filter.shouldNotFilter(logoutRequest)).isTrue();
        assertThat(filter.shouldNotFilter(privateRequest)).isFalse();
    }
}

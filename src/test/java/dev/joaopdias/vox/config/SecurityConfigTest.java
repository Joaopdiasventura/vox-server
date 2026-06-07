package dev.joaopdias.vox.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import dev.joaopdias.vox.shared.security.JwtAuthFilter;
import jakarta.servlet.DispatcherType;

class SecurityConfigTest {
    @Test
    void marksOnlyIntendedEndpointsAsPublic() {
        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.OPTIONS.name(), "/anything")).isTrue();
        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.POST.name(), "/user")).isTrue();
        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.POST.name(), "/user/login")).isTrue();
        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.POST.name(), "/user/logout")).isTrue();
        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.PATCH.name(), "/user/validate-account")).isTrue();
        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.PATCH.name(), "/user/reset-password")).isTrue();

        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.GET.name(), "/user")).isFalse();
        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.PATCH.name(), "/user")).isFalse();
        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.DELETE.name(), "/user")).isFalse();
        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.GET.name(), "/user/login")).isFalse();
        assertThat(SecurityConfig.isPublicEndpoint(HttpMethod.POST.name(), "/user/reset-password")).isFalse();
    }

    @Test
    void healthMatcherAllowsOnlyGetHealthEndpoint() {
        assertThat(SecurityConfig.HEALTH_ENDPOINTS.matches(request(HttpMethod.GET, "/actuator/health"))).isTrue();
        assertThat(SecurityConfig.HEALTH_ENDPOINTS.matches(request(HttpMethod.POST, "/actuator/health"))).isFalse();
        assertThat(SecurityConfig.HEALTH_ENDPOINTS.matches(request(HttpMethod.GET, "/actuator/info"))).isFalse();
    }

    @Test
    void errorMatcherAllowsErrorDispatchAndErrorPath() {
        MockHttpServletRequest errorDispatch = request(HttpMethod.GET, "/anything");
        errorDispatch.setDispatcherType(DispatcherType.ERROR);

        assertThat(SecurityConfig.ERROR_ENDPOINTS.matches(errorDispatch)).isTrue();
        assertThat(SecurityConfig.ERROR_ENDPOINTS.matches(request(HttpMethod.GET, "/error"))).isTrue();
    }

    @Test
    void normalizesContextPathAndTrailingSlash() {
        MockHttpServletRequest request = request(HttpMethod.POST, "/api/user/login/");
        request.setContextPath("/api");

        assertThat(SecurityConfig.normalizedPath(request)).isEqualTo("/user/login");
        assertThat(SecurityConfig.PUBLIC_ENDPOINTS.matches(request)).isTrue();
    }

    @Test
    void disablesServletContainerRegistrationForJwtFilter() {
        SecurityConfig config = new SecurityConfig(
            new JwtAuthFilter(),
            new UrlBasedCorsConfigurationSource()
        );

        FilterRegistrationBean<JwtAuthFilter> registration =
            config.jwtAuthFilterRegistration(new JwtAuthFilter());

        assertThat(registration.isEnabled()).isFalse();
    }

    private static MockHttpServletRequest request(HttpMethod method, String path) {
        MockHttpServletRequest request = new MockHttpServletRequest(method.name(), path);
        request.setServletPath(path);
        return request;
    }
}

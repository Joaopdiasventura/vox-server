package dev.joaopdias.vox.config;

import dev.joaopdias.vox.shared.security.JwtAuthFilter;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;

@Configuration
public class SecurityConfig {
    static final RequestMatcher ERROR_ENDPOINTS = request ->
            DispatcherType.ERROR.equals(request.getDispatcherType())
                    || "/error".equals(normalizedPath(request));

    static final RequestMatcher HEALTH_ENDPOINTS = request ->
            HttpMethod.GET.matches(request.getMethod())
                    && "/actuator/health".equals(normalizedPath(request));

    static final RequestMatcher PUBLIC_ENDPOINTS = request ->
            isPublicEndpoint(request.getMethod(), normalizedPath(request));

    static final RequestMatcher STOMP_ENDPOINTS = request ->
            isStompEndpoint(normalizedProtocol(request));

    private final JwtAuthFilter jwtAuthFilter;

    private final UrlBasedCorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter,
            UrlBasedCorsConfigurationSource corsConfigurationSource
    ) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    static boolean isPublicEndpoint(String method, String path) {
        if (HttpMethod.OPTIONS.matches(method)) return true;

        if (HttpMethod.POST.matches(method))
            return "/user".equals(path)
                    || "/user/login".equals(path)
                    || "/user/logout".equals(path);

        if (HttpMethod.PATCH.matches(method))
            return "/user/validate-account".equals(path)
                    || "/user/reset-password".equals(path);

        return false;
    }

    static boolean isStompEndpoint(String protocol) {
        return protocol.equals("/ws") || protocol.startsWith("/ws/");
    }

    static String normalizedPath(HttpServletRequest request) {
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();

        if (contextPath != null && !contextPath.isBlank() && path.startsWith(contextPath))
            path = path.substring(contextPath.length());

        if (path.length() > 1 && path.endsWith("/"))
            path = path.substring(0, path.length() - 1);

        return path;
    }

    static String normalizedProtocol(HttpServletRequest request) {
        return request.getServletPath();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .requestCache(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"message\":\"Faça login novamente.\"}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(ERROR_ENDPOINTS).permitAll()
                        .requestMatchers(HEALTH_ENDPOINTS).permitAll()
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(STOMP_ENDPOINTS).permitAll()
                        .requestMatchers("/ws", "/ws/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilterRegistration(JwtAuthFilter jwtAuthFilter) {
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>(jwtAuthFilter);
        registration.setEnabled(false);
        return registration;
    }
}

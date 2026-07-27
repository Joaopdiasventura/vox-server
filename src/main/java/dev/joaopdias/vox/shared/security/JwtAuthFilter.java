package dev.joaopdias.vox.shared.security;

import dev.joaopdias.vox.shared.services.SecurityService;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final String AUTHORIZATION_COOKIE_NAME = "Authorization";

    private final SecurityService securityService;

    public JwtAuthFilter(SecurityService securityService) {
        this.securityService = securityService;
    }

    public static String getAuthorizationCookieName() {
        return AUTHORIZATION_COOKIE_NAME;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String token = getToken(request);

        if (token == null || token.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            UUID id = securityService.decodeJwt(token);

            AuthenticatedUser authenticatedUser = new AuthenticatedUser(id);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    authenticatedUser,
                    null,
                    List.of()
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (IllegalArgumentException exception) {
            SecurityContextHolder.clearContext();
            ResponseCookie cookie = ResponseCookie.from(AUTHORIZATION_COOKIE_NAME, "")
                    .httpOnly(true)
                    .path("/")
                    .maxAge(0)
                    .build();

            response.addHeader("Set-Cookie", cookie.toString());
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"Faça login novamente.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = normalizedPath(request);
        String protocol = request.getServletPath();

        if (DispatcherType.ERROR.equals(request.getDispatcherType()) || "/error".equals(path)) return true;

        if (HttpMethod.OPTIONS.matches(request.getMethod())) return true;

        if (HttpMethod.PATCH.matches(request.getMethod())
                && "/user/reset-password".equals(path) || "/user/validate-account".equals(path))
            return true;

        if (HttpMethod.POST.matches(request.getMethod())
                && ("/user".equals(path) || "/user/login".equals(path) || "/user/logout".equals(path)))
            return true;

        return protocol.equals("/ws") || protocol.startsWith("/ws/");
    }

    private String getToken(HttpServletRequest request) {
        String cookieToken = getCookieValue(request, AUTHORIZATION_COOKIE_NAME);

        if (hasText(cookieToken)) return cookieToken;

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (hasText(authorization) && authorization.regionMatches(true, 0, "Bearer ", 0, 7))
            return authorization.substring(7).trim();

        return "";
    }

    private String normalizedPath(HttpServletRequest request) {
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();

        if (contextPath != null && !contextPath.isBlank() && path.startsWith(contextPath))
            path = path.substring(contextPath.length());

        if (path.length() > 1 && path.endsWith("/"))
            path = path.substring(0, path.length() - 1);

        return path;
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) return null;

        for (Cookie cookie : cookies)
            if (name.equals(cookie.getName())) return cookie.getValue();

        return null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}

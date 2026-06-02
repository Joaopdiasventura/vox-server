package dev.joaopdias.vox.shared.services;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Base64;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import tools.jackson.databind.ObjectMapper;

class SecurityServiceTest {
    @Test
    void hashesAndMatchesPasswords() {
        SecurityService securityService = newSecurityService(15);

        String hash = securityService.hashPassword("SenhaForte1!");

        assertThat(hash).isNotEqualTo("SenhaForte1!");
        assertThat(securityService.matchesPassword("SenhaForte1!", hash)).isTrue();
        assertThat(securityService.matchesPassword("SenhaErrada1!", hash)).isFalse();
    }

    @Test
    void createsAndDecodesJwt() {
        SecurityService securityService = newSecurityService(15);
        UUID userId = UUID.randomUUID();

        String token = securityService.createJwt(userId);

        assertThat(token.split("\\.")).hasSize(3);
        assertThat(securityService.decodeJwt(token)).isEqualTo(userId);
    }

    @Test
    void rejectsMalformedJwt() {
        SecurityService securityService = newSecurityService(15);

        assertThatThrownBy(() -> securityService.decodeJwt("invalid-token"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Token JWT inválido.");
    }

    @Test
    void rejectsJwtWithInvalidSignature() {
        SecurityService securityService = newSecurityService(15);
        UUID userId = UUID.randomUUID();
        String token = securityService.createJwt(userId);
        String[] parts = token.split("\\.");
        String tamperedPayload = Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(("""
                {"sub":"%s","iat":1,"exp":4102444800}
                """.formatted(UUID.randomUUID())).getBytes(UTF_8));
        String tamperedToken = parts[0] + "." + tamperedPayload + "." + parts[2];

        assertThatThrownBy(() -> securityService.decodeJwt(tamperedToken))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Assinatura do token JWT inválida.");
    }

    @Test
    void rejectsExpiredJwt() {
        SecurityService securityService = newSecurityService(-1);
        UUID userId = UUID.randomUUID();
        String token = securityService.createJwt(userId);

        assertThatThrownBy(() -> securityService.decodeJwt(token))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Token JWT expirado.");
    }

    private static SecurityService newSecurityService(long expiresInMinutes) {
        SecurityService securityService = new SecurityService("test-secret", expiresInMinutes);
        ReflectionTestUtils.setField(securityService, "objectMapper", new ObjectMapper());
        return securityService;
    }
}

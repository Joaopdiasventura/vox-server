package dev.joaopdias.vox.shared.services;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Base64;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

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

    @Test
    void rejectsSignedJwtWithMissingRequiredPayloadFields() throws Exception {
        SecurityService securityService = newSecurityService(15);
        String token = signedToken("""
            {"sub":"%s","iat":1}
            """.formatted(UUID.randomUUID()));

        assertThatThrownBy(() -> securityService.decodeJwt(token))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Token JWT inválido.");
    }

    @Test
    void rejectsSignedJwtWithInvalidSubject() throws Exception {
        SecurityService securityService = newSecurityService(15);
        String token = signedToken("""
            {"sub":"not-a-uuid","iat":1,"exp":4102444800}
            """);

        assertThatThrownBy(() -> securityService.decodeJwt(token))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Token JWT inválido.");
    }

    @Test
    void generatesRandomWordWithRequiredLengthAndCharacterClasses() {
        SecurityService securityService = newSecurityService(15);

        String word = securityService.generateRandomWord(32);

        assertThat(word).hasSize(32);
        assertThat(word).containsPattern("[A-Z]");
        assertThat(word).containsPattern("[a-z]");
        assertThat(word).containsPattern("\\d");
        assertThat(word).containsPattern("[@$!%*?&._#\\-]");
        assertThat(word).containsPattern("^[A-Za-z\\d@$!%*?&._#\\-]+$");
    }

    @Test
    void rejectsRandomWordLengthBelowMinimum() {
        SecurityService securityService = newSecurityService(15);

        assertThatThrownBy(() -> securityService.generateRandomWord(7))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("A palavra aleatória deve ter no mínimo 8 caracteres.");
    }

    private static SecurityService newSecurityService(long expiresInMinutes) {
        SecurityService securityService = new SecurityService(expiresInMinutes, new ObjectMapper());
        ReflectionTestUtils.setField(securityService, "jwtSecret", "test-secret");
        return securityService;
    }

    private static String signedToken(String payloadJson) throws Exception {
        String encodedHeader = base64UrlEncode("""
            {"typ":"JWT","alg":"HS256"}
            """.getBytes(UTF_8));
        String encodedPayload = base64UrlEncode(payloadJson.getBytes(UTF_8));
        String unsignedToken = encodedHeader + "." + encodedPayload;

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("test-secret".getBytes(UTF_8), "HmacSHA256"));

        return unsignedToken + "." + base64UrlEncode(mac.doFinal(unsignedToken.getBytes(UTF_8)));
    }

    private static String base64UrlEncode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }
}

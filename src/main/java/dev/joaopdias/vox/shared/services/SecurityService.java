package dev.joaopdias.vox.shared.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class SecurityService {
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String RANDOM_WORD_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&._#-";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    private final Duration jwtExpiresIn;

    private final Argon2PasswordEncoder passwordEncoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();

    public SecurityService(@Value("${security.jwt.expires-in-minutes}") long jwtExpiresInMinutes) {
        this.jwtExpiresIn = Duration.ofMinutes(jwtExpiresInMinutes);
    }

    public String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }

    public boolean matchesPassword(String rawPassword, String passwordHash) {
        return passwordEncoder.matches(rawPassword, passwordHash);
    }

    public String generateRandomWord(int length) {
        if (length < 8)
            throw new IllegalArgumentException("A palavra aleatória deve ter no mínimo 8 caracteres.");

        StringBuilder value = new StringBuilder(length);

        value.append(randomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ"));
        value.append(randomChar("abcdefghijklmnopqrstuvwxyz"));
        value.append(randomChar("@$!%*?&._#-"));
        value.append(randomChar("0123456789"));

        while (value.length() < length)
            value.append(randomChar(RANDOM_WORD_CHARACTERS));

        return shuffle(value.toString());
    }

    public String createJwt(UUID userId) {
        try {
            Instant now = Instant.now();
            Instant expiresAt = now.plus(jwtExpiresIn);

            String header = objectMapper.writeValueAsString(new JwtHeader("JWT", "HS256"));

            JwtPayload payload = new JwtPayload(
                userId.toString(),
                now.getEpochSecond(),
                expiresAt.getEpochSecond()
            );

            String payloadJson = objectMapper.writeValueAsString(payload);

            String encodedHeader = base64UrlEncode(header.getBytes(StandardCharsets.UTF_8));
            String encodedPayload = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));
            String unsignedToken = encodedHeader + "." + encodedPayload;
            String signature = sign(unsignedToken);

            return unsignedToken + "." + signature;
        } catch (Exception exception) {
            throw new IllegalStateException("Não foi possível criar o token JWT.", exception);
        }
    }

    public UUID decodeJwt(String token) {
        try {
            String[] parts = token.split("\\.");

            if (parts.length != 3) 
                throw new IllegalArgumentException("Token JWT inválido.");

            String unsignedToken = parts[0] + "." + parts[1];
            String expectedSignature = sign(unsignedToken);

            if (!MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8)
            )) 
                throw new IllegalArgumentException("Assinatura do token JWT inválida.");

            String payloadJson = new String(base64UrlDecode(parts[1]), StandardCharsets.UTF_8);
            JsonNode payload = objectMapper.readTree(payloadJson);

            JsonNode expiresAtNode = payload.get("exp");
            JsonNode subjectNode = payload.get("sub");

            if (expiresAtNode == null || subjectNode == null)
                throw new IllegalArgumentException("Token JWT inválido.");

            Instant expiresAt = Instant.ofEpochSecond(expiresAtNode.asLong());

            if (Instant.now().isAfter(expiresAt))
                throw new IllegalArgumentException("Token JWT expirado.");

            try {
                return UUID.fromString(subjectNode.stringValue());
            } catch (IllegalArgumentException exception) {
                throw new IllegalArgumentException("Token JWT inválido.", exception);
            }
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalArgumentException("Token JWT inválido.", exception);
        }
    }

    private char randomChar(String characters) {
        return characters.charAt(SECURE_RANDOM.nextInt(characters.length()));
    }

    private String shuffle(String value) {
        char[] characters = value.toCharArray();

        for (int index = characters.length - 1; index > 0; index--) {
            int randomIndex = SECURE_RANDOM.nextInt(index + 1);
            char current = characters[index];
            characters[index] = characters[randomIndex];
            characters[randomIndex] = current;
        }

        return new String(characters);
    }

    private String sign(String content) throws Exception {
        Mac mac = Mac.getInstance(HMAC_ALGORITHM);
        SecretKeySpec key = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
        mac.init(key);

        return base64UrlEncode(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private byte[] base64UrlDecode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }

    private record JwtHeader(
        String typ,
        String alg
    ) {
    }

    private record JwtPayload(
        String sub,
        long iat,
        long exp
    ) {
    }

    public record DecodedJwt(
        UUID userId,
        Instant issuedAt,
        Instant expiresAt
    ) {
    }
}

package dev.joaopdias.vox.core.user.entities;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import dev.joaopdias.vox.core.user.dto.UserResponseDto;

class UserTest {
    @Test
    void prePersistInitializesCreationFields() {
        User user = new User();
        Instant before = Instant.now();

        user.prePersist();

        assertThat(user.getCreatedAt()).isBetween(before, Instant.now());
        assertThat(user.getIsValidated()).isFalse();
    }

    @Test
    void toResponseDtoExposesPublicUserDataOnly() {
        Instant createdAt = Instant.parse("2026-01-01T00:00:00Z");
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("ana@example.com");
        user.setName("Ana");
        user.setPassword("hashed-password");
        user.setCreatedAt(createdAt);
        user.setIsValidated(true);

        UserResponseDto response = user.toResponseDto();

        assertThat(response.email()).isEqualTo(user.getEmail());
        assertThat(response.name()).isEqualTo(user.getName());
        assertThat(response.createdAt()).isEqualTo(createdAt);
    }
}

package dev.joaopdias.vox.core.user.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class UserDtoValidationTest {
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void createUserDtoAcceptsValidData() {
        CreateUserDto dto = new CreateUserDto("ana@example.com", "Ana", "SenhaForte1!");

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void createUserDtoRejectsInvalidData() {
        CreateUserDto dto = new CreateUserDto("email-invalido", "A", "fraca");

        assertThat(invalidProperties(dto)).containsExactlyInAnyOrder("email", "name", "password");
    }

    @Test
    void loginUserDtoAcceptsValidData() {
        LoginUserDto dto = new LoginUserDto("ana@example.com", "SenhaForte1!");

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void loginUserDtoRejectsInvalidData() {
        LoginUserDto dto = new LoginUserDto("email-invalido", "fraca");

        assertThat(invalidProperties(dto)).containsExactlyInAnyOrder("email", "password");
    }

    @Test
    void updateUserDtoAllowsPartialUpdates() {
        UpdateUserDto dto = new UpdateUserDto(null, null, null);

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void updateUserDtoRejectsInvalidProvidedFields() {
        UpdateUserDto dto = new UpdateUserDto("email-invalido", "A", "fraca");

        assertThat(invalidProperties(dto)).containsExactlyInAnyOrder("email", "name", "password");
    }

    @Test
    void authResponseDtoPreservesTokenAndUser() {
        UserResponseDto user = new UserResponseDto(UUID.randomUUID(), "ana@example.com", "Ana", Instant.parse("2026-01-01T00:00:00Z"));

        AuthResponseDto dto = new AuthResponseDto("jwt", user);

        assertThat(dto.token()).isEqualTo("jwt");
        assertThat(dto.user()).isEqualTo(user);
    }

    @Test
    void userResponseDtoPreservesUserFields() {
        UUID id = UUID.randomUUID();
        Instant createdAt = Instant.parse("2026-01-01T00:00:00Z");

        UserResponseDto dto = new UserResponseDto(id, "ana@example.com", "Ana", createdAt);

        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.email()).isEqualTo("ana@example.com");
        assertThat(dto.name()).isEqualTo("Ana");
        assertThat(dto.createdAt()).isEqualTo(createdAt);
    }

    private static Set<String> invalidProperties(Object dto) {
        return validator.validate(dto)
            .stream()
            .map(ConstraintViolation::getPropertyPath)
            .map(Object::toString)
            .collect(Collectors.toSet());
    }
}

package dev.joaopdias.vox.core.election.dto;

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

class ElectionDtoValidationTest {
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void createElectionDtoAcceptsValidData() {
        CreateElectionDto dto = new CreateElectionDto("Eleição 2026");

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void createElectionDtoRejectsMissingName() {
        CreateElectionDto dto = new CreateElectionDto(null);

        assertThat(invalidProperties(dto)).containsExactly("name");
    }

    @Test
    void updateElectionDtoAllowsPartialUpdates() {
        UpdateElectionDto dto = new UpdateElectionDto(null);

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void electionResponseDtoPreservesElectionFields() {
        UUID id = UUID.randomUUID();
        Instant createdAt = Instant.parse("2026-01-01T00:00:00Z");

        ElectionResponseDto dto = new ElectionResponseDto(id, "Eleição 2026", createdAt);

        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo("Eleição 2026");
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

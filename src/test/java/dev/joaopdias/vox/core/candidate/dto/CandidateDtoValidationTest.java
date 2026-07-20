package dev.joaopdias.vox.core.candidate.dto;

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

class CandidateDtoValidationTest {
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void createCandidateDtoAcceptsValidData() {
        CreateCandidateDto dto = new CreateCandidateDto("Ana", UUID.randomUUID());

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void createCandidateDtoRejectsMissingData() {
        CreateCandidateDto dto = new CreateCandidateDto(null, null);

        assertThat(invalidProperties(dto)).containsExactlyInAnyOrder("name", "electionId");
    }

    @Test
    void updateCandidateDtoAllowsPartialUpdates() {
        UpdateCandidateDto dto = new UpdateCandidateDto(null);

        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void candidateResponseDtoPreservesCandidateFields() {
        UUID id = UUID.randomUUID();
        Instant createdAt = Instant.parse("2026-01-01T00:00:00Z");

        CandidateResponseDto dto = new CandidateResponseDto(id, "Ana", createdAt);

        assertThat(dto.id()).isEqualTo(id);
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

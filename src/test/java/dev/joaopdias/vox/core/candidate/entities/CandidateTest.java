package dev.joaopdias.vox.core.candidate.entities;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import dev.joaopdias.vox.core.candidate.dto.CandidateResponseDto;

class CandidateTest {
    @Test
    void prePersistInitializesCreationDate() {
        Candidate candidate = new Candidate();
        Instant before = Instant.now();

        candidate.prePersist();

        assertThat(candidate.getCreatedAt()).isBetween(before, Instant.now());
    }

    @Test
    void toResponseDtoExposesCandidateData() {
        Instant createdAt = Instant.parse("2026-01-01T00:00:00Z");
        Candidate candidate = new Candidate();
        candidate.setId(UUID.randomUUID());
        candidate.setName("Ana");
        candidate.setCreatedAt(createdAt);

        CandidateResponseDto response = candidate.toResponseDto();

        assertThat(response.id()).isEqualTo(candidate.getId());
        assertThat(response.name()).isEqualTo(candidate.getName());
        assertThat(response.createdAt()).isEqualTo(createdAt);
    }
}

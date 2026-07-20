package dev.joaopdias.vox.core.election.entities;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import dev.joaopdias.vox.core.election.dto.ElectionResponseDto;

class ElectionTest {
    @Test
    void prePersistInitializesCreationDate() {
        Election election = new Election();
        Instant before = Instant.now();

        election.prePersist();

        assertThat(election.getCreatedAt()).isBetween(before, Instant.now());
    }

    @Test
    void toResponseDtoExposesElectionData() {
        Instant createdAt = Instant.parse("2026-01-01T00:00:00Z");
        Election election = new Election();
        election.setId(UUID.randomUUID());
        election.setName("Eleição 2026");
        election.setCreatedAt(createdAt);

        ElectionResponseDto response = election.toResponseDto();

        assertThat(response.id()).isEqualTo(election.getId());
        assertThat(response.name()).isEqualTo(election.getName());
        assertThat(response.createdAt()).isEqualTo(createdAt);
    }
}

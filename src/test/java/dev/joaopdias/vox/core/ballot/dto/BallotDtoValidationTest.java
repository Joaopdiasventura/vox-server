package dev.joaopdias.vox.core.ballot.dto;

import dev.joaopdias.vox.core.election.dto.ElectionResponseDto;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class BallotDtoValidationTest {
    private static ElectionResponseDto election(UUID id) {
        return new ElectionResponseDto(id, "Eleição 2026", Instant.parse("2026-01-01T00:00:00Z"));
    }

    @Test
    void createBallotDtoPreservesFields() {
        Set<UUID> electionsId = Set.of(UUID.randomUUID(), UUID.randomUUID());
        Instant startAt = Instant.parse("2026-01-01T00:00:00Z");
        Instant endAt = Instant.parse("2026-01-02T00:00:00Z");

        CreateBallotDto dto = new CreateBallotDto(electionsId, startAt, endAt);

        assertThat(dto.electionsId()).isEqualTo(electionsId);
        assertThat(dto.startAt()).isEqualTo(startAt);
        assertThat(dto.endAt()).isEqualTo(endAt);
    }

    @Test
    void ballotResponseDtoPreservesBallotFields() {
        UUID id = UUID.randomUUID();
        Instant startAt = Instant.parse("2026-01-01T00:00:00Z");
        Instant endAt = Instant.parse("2026-01-02T00:00:00Z");
        Set<ElectionResponseDto> elections = Set.of(election(UUID.randomUUID()));

        BallotResponseDto dto = new BallotResponseDto(id, elections, false, startAt, endAt);

        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.elections()).isEqualTo(elections);
        assertThat(dto.isOpen()).isFalse();
        assertThat(dto.startAt()).isEqualTo(startAt);
        assertThat(dto.endAt()).isEqualTo(endAt);
    }
}

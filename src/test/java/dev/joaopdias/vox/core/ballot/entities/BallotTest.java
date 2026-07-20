package dev.joaopdias.vox.core.ballot.entities;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import dev.joaopdias.vox.core.ballot.dto.BallotResponseDto;
import dev.joaopdias.vox.core.election.entities.Election;

class BallotTest {
    @Test
    void toResponseDtoExposesBallotData() {
        Instant startAt = Instant.parse("2026-01-01T00:00:00Z");
        Instant endAt = Instant.parse("2026-01-02T00:00:00Z");
        Set<Election> elections = Set.of(election(UUID.randomUUID()));
        Ballot ballot = new Ballot();
        ballot.setId(UUID.randomUUID());
        ballot.setElections(elections);
        ballot.setStartAt(startAt);
        ballot.setEndAt(endAt);

        BallotResponseDto response = ballot.toResponseDto();

        assertThat(response.id()).isEqualTo(ballot.getId());
        assertThat(response.elections()).isEqualTo(elections);
        assertThat(response.startAt()).isEqualTo(startAt);
        assertThat(response.endAt()).isEqualTo(endAt);
    }

    private static Election election(UUID id) {
        Election election = new Election();
        election.setId(id);
        election.setName("Eleição 2026");
        election.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return election;
    }
}

package dev.joaopdias.vox.core.ballot.dto;

import dev.joaopdias.vox.core.election.entities.Election;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record BallotResponseDto(
        UUID id,
        Set<Election> elections,
        Instant startAt,
        Instant endAt
) {
}

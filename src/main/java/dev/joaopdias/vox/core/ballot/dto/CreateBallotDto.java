package dev.joaopdias.vox.core.ballot.dto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record CreateBallotDto(
        Set<UUID> electionsId,
        Instant startAt,
        Instant endAt
) {
}

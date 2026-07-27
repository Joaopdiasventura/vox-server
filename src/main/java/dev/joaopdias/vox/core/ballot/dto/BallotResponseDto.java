package dev.joaopdias.vox.core.ballot.dto;

import dev.joaopdias.vox.core.election.dto.ElectionResponseDto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record BallotResponseDto(
        UUID id,
        Set<ElectionResponseDto> elections,
        Boolean isOpen,
        Instant startAt,
        Instant endAt

) {
}

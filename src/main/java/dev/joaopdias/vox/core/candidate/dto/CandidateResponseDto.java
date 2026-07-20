package dev.joaopdias.vox.core.candidate.dto;

import java.time.Instant;
import java.util.UUID;

public record CandidateResponseDto(
        UUID id,
        String name,
        Instant createdAt
) {
}

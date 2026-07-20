package dev.joaopdias.vox.core.election.dto;

import java.time.Instant;
import java.util.UUID;

public record ElectionResponseDto(
    UUID id,
    String name,
    Instant createdAt
) {
    
}

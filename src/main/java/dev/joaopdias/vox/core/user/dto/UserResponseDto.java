package dev.joaopdias.vox.core.user.dto;

import java.time.Instant;

public record UserResponseDto(
    String email,
    String name,
    Instant createdAt
) {
}
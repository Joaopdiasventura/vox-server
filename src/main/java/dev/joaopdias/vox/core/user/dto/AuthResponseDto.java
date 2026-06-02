package dev.joaopdias.vox.core.user.dto;

public record AuthResponseDto (
    String token,
    UserResponseDto user
) {
    
}
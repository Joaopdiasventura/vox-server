package dev.joaopdias.vox.core.election.dto;

import jakarta.validation.constraints.NotNull;

public record CreateElectionDto(
    @NotNull(message = "Digite um nome válido")
    String name
) {
    
}

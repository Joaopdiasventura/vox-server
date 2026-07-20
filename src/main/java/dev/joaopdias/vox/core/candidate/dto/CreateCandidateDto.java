package dev.joaopdias.vox.core.candidate.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateCandidateDto(
        @NotNull(message = "Digite um nome válido")
        String name,

        @NotNull(message = "Selecione uma eleição válida")
        UUID electionId
) {
}

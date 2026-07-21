package dev.joaopdias.vox.core.vote.dto;

import java.util.UUID;

public record CreateVoteDto(
        UUID candidateId,
        UUID ballotId
) {
}

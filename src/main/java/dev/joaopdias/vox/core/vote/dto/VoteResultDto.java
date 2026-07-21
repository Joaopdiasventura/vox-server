package dev.joaopdias.vox.core.vote.dto;

import dev.joaopdias.vox.core.candidate.entities.Candidate;

public record VoteResultDto(
        Long count,
        Candidate candidate
) {
}

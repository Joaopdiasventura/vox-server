package dev.joaopdias.vox.core.vote.dto;

import dev.joaopdias.vox.core.candidate.dto.CandidateResponseDto;

public record VoteResultDto(
        Long count,
        CandidateResponseDto candidate
) {
}

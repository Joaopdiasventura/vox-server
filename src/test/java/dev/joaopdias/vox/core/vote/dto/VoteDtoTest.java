package dev.joaopdias.vox.core.vote.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import dev.joaopdias.vox.core.candidate.entities.Candidate;

class VoteDtoTest {
    @Test
    void createVoteDtoPreservesFields() {
        UUID candidateId = UUID.randomUUID();
        UUID ballotId = UUID.randomUUID();

        CreateVoteDto dto = new CreateVoteDto(candidateId, ballotId);

        assertThat(dto.candidateId()).isEqualTo(candidateId);
        assertThat(dto.ballotId()).isEqualTo(ballotId);
    }

    @Test
    void voteResultDtoPreservesFields() {
        Candidate candidate = new Candidate();
        candidate.setId(UUID.randomUUID());
        candidate.setName("Ana");

        VoteResultDto dto = new VoteResultDto(5L, candidate);

        assertThat(dto.count()).isEqualTo(5L);
        assertThat(dto.candidate()).isEqualTo(candidate);
    }
}

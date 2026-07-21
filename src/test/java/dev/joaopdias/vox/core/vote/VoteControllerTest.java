package dev.joaopdias.vox.core.vote;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import dev.joaopdias.vox.core.candidate.entities.Candidate;
import dev.joaopdias.vox.core.vote.dto.CreateVoteDto;
import dev.joaopdias.vox.core.vote.dto.VoteResultDto;

@ExtendWith(MockitoExtension.class)
class VoteControllerTest {
    @Mock
    private VoteService voteService;

    private VoteController controller;

    @BeforeEach
    void setUp() {
        controller = new VoteController(voteService);
    }

    @Test
    void createDelegatesToServiceAndReturnsMessage() {
        CreateVoteDto request = new CreateVoteDto(UUID.randomUUID(), UUID.randomUUID());
        when(voteService.create(request)).thenReturn("Voto registrado com sucesso");

        String result = controller.create(request);

        assertThat(result).isEqualTo("Voto registrado com sucesso");
        verify(voteService).create(request);
    }

    @Test
    void findResultDelegatesToServiceUsingElectionAndBallotIds() {
        UUID electionId = UUID.randomUUID();
        UUID ballotId = UUID.randomUUID();
        VoteResultDto resultDto = new VoteResultDto(3L, candidate(UUID.randomUUID(), "Ana"));
        when(voteService.findResult(electionId, ballotId)).thenReturn(List.of(resultDto));

        List<VoteResultDto> result = controller.findResult(electionId, ballotId);

        assertThat(result).containsExactly(resultDto);
        verify(voteService).findResult(electionId, ballotId);
    }

    private static Candidate candidate(UUID id, String name) {
        Candidate candidate = new Candidate();
        candidate.setId(id);
        candidate.setName(name);
        return candidate;
    }
}

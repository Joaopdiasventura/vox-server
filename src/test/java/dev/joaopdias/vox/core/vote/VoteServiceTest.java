package dev.joaopdias.vox.core.vote;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import dev.joaopdias.vox.core.ballot.BallotService;
import dev.joaopdias.vox.core.ballot.entities.Ballot;
import dev.joaopdias.vox.core.candidate.CandidateService;
import dev.joaopdias.vox.core.candidate.entities.Candidate;
import dev.joaopdias.vox.core.vote.dto.CreateVoteDto;
import dev.joaopdias.vox.core.vote.dto.VoteResultDto;
import dev.joaopdias.vox.core.vote.entities.Vote;

@ExtendWith(MockitoExtension.class)
class VoteServiceTest {
    @Mock
    private VoteRepository voteRepository;

    @Mock
    private CandidateService candidateService;

    @Mock
    private BallotService ballotService;

    private VoteService service;

    @BeforeEach
    void setUp() {
        service = new VoteService(voteRepository, candidateService, ballotService);
    }

    @Test
    void createPersistsVoteClosesBallotAndReturnsSuccessMessage() {
        Candidate candidate = candidate(UUID.randomUUID(), "Ana");
        Ballot ballot = ballot(UUID.randomUUID(), true, Instant.now().minusSeconds(60), Instant.now().plusSeconds(3600));
        CreateVoteDto request = new CreateVoteDto(candidate.getId(), ballot.getId());
        when(candidateService.findById(candidate.getId())).thenReturn(candidate);
        when(ballotService.findById(ballot.getId())).thenReturn(ballot);

        String result = service.create(request);

        ArgumentCaptor<Vote> voteCaptor = ArgumentCaptor.forClass(Vote.class);
        verify(voteRepository).save(voteCaptor.capture());
        Vote savedVote = voteCaptor.getValue();
        assertThat(savedVote.getCandidate()).isEqualTo(candidate);
        assertThat(savedVote.getBallot()).isEqualTo(ballot);
        verify(ballotService).changeState(ballot.getId(), Boolean.FALSE);
        assertThat(result).isEqualTo("Voto registrado com sucesso");
    }

    @Test
    void createRejectsClosedBallot() {
        Candidate candidate = candidate(UUID.randomUUID(), "Ana");
        Ballot ballot = ballot(UUID.randomUUID(), false, Instant.now().minusSeconds(60), Instant.now().plusSeconds(3600));
        CreateVoteDto request = new CreateVoteDto(candidate.getId(), ballot.getId());
        when(candidateService.findById(candidate.getId())).thenReturn(candidate);
        when(ballotService.findById(ballot.getId())).thenReturn(ballot);

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                assertThat(exception.getReason()).isEqualTo("A urna não está aberta");
            });

        verify(voteRepository, never()).save(any());
        verify(ballotService, never()).changeState(any(), any());
    }

    @Test
    void createRejectsBallotBeforeStartTime() {
        Candidate candidate = candidate(UUID.randomUUID(), "Ana");
        Ballot ballot = ballot(UUID.randomUUID(), true, Instant.now().plusSeconds(3600), Instant.now().plusSeconds(7200));
        CreateVoteDto request = new CreateVoteDto(candidate.getId(), ballot.getId());
        when(candidateService.findById(candidate.getId())).thenReturn(candidate);
        when(ballotService.findById(ballot.getId())).thenReturn(ballot);

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                assertThat(exception.getReason()).isEqualTo("Essa votação ainda não iniciou");
            });

        verify(voteRepository, never()).save(any());
        verify(ballotService, never()).changeState(any(), any());
    }

    @Test
    void createRejectsBallotAfterEndTime() {
        Candidate candidate = candidate(UUID.randomUUID(), "Ana");
        Ballot ballot = ballot(UUID.randomUUID(), true, Instant.now().minusSeconds(7200), Instant.now().minusSeconds(60));
        CreateVoteDto request = new CreateVoteDto(candidate.getId(), ballot.getId());
        when(candidateService.findById(candidate.getId())).thenReturn(candidate);
        when(ballotService.findById(ballot.getId())).thenReturn(ballot);

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                assertThat(exception.getReason()).isEqualTo("Essa votação já encerrou");
            });

        verify(voteRepository, never()).save(any());
        verify(ballotService, never()).changeState(any(), any());
    }

    @Test
    void findResultDelegatesToRepository() {
        UUID electionId = UUID.randomUUID();
        UUID ballotId = UUID.randomUUID();
        VoteResultDto resultDto = new VoteResultDto(2L, candidate(UUID.randomUUID(), "Ana"));
        when(voteRepository.findResult(electionId, ballotId)).thenReturn(List.of(resultDto));

        List<VoteResultDto> result = service.findResult(electionId, ballotId);

        assertThat(result).containsExactly(resultDto);
        verify(voteRepository).findResult(electionId, ballotId);
    }

    private static Candidate candidate(UUID id, String name) {
        Candidate candidate = new Candidate();
        candidate.setId(id);
        candidate.setName(name);
        return candidate;
    }

    private static Ballot ballot(UUID id, Boolean isOpen, Instant startAt, Instant endAt) {
        Ballot ballot = new Ballot();
        ballot.setId(id);
        ballot.setIsOpen(isOpen);
        ballot.setStartAt(startAt);
        ballot.setEndAt(endAt);
        return ballot;
    }
}

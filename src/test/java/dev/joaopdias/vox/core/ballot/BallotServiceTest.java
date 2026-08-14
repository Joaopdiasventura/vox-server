package dev.joaopdias.vox.core.ballot;

import dev.joaopdias.vox.core.ballot.dto.BallotResponseDto;
import dev.joaopdias.vox.core.ballot.dto.CreateBallotDto;
import dev.joaopdias.vox.core.ballot.entities.Ballot;
import dev.joaopdias.vox.core.election.ElectionService;
import dev.joaopdias.vox.core.election.dto.ElectionResponseDto;
import dev.joaopdias.vox.core.election.entities.Election;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BallotServiceTest {
    private static final Instant START_AT = Instant.parse("2026-01-01T00:00:00Z");
    private static final Instant END_AT = Instant.parse("2026-01-02T00:00:00Z");

    @Mock
    private BallotRepository ballotRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ElectionService electionService;

    private BallotService service;

    private static Ballot ballot(UUID id, Instant startAt, Instant endAt) {
        Ballot ballot = new Ballot();
        ballot.setId(id);
        ballot.setElections(Set.of(election(UUID.randomUUID())));
        ballot.setStartAt(startAt);
        ballot.setEndAt(endAt);
        return ballot;
    }

    private static Election election(UUID id) {
        Election election = new Election();
        election.setId(id);
        election.setName("Eleição 2026");
        election.setCreatedAt(START_AT);
        return election;
    }

    @BeforeEach
    void setUp() {
        service = new BallotService(ballotRepository, messagingTemplate, electionService);
    }

    @Test
    void createPersistsBallotWithElectionsAndReturnsResponse() {
        UUID firstElectionId = UUID.randomUUID();
        UUID secondElectionId = UUID.randomUUID();
        Election firstElection = election(firstElectionId);
        Election secondElection = election(secondElectionId);
        CreateBallotDto request = new CreateBallotDto(Set.of(firstElectionId, secondElectionId), START_AT, END_AT);
        when(electionService.findById(firstElectionId)).thenReturn(firstElection);
        when(electionService.findById(secondElectionId)).thenReturn(secondElection);
        when(ballotRepository.save(any(Ballot.class))).thenAnswer(invocation -> {
            Ballot ballot = invocation.getArgument(0);
            ballot.setId(UUID.randomUUID());
            ballot.setIsOpen(Boolean.FALSE);
            return ballot;
        });

        BallotResponseDto response = service.create(request);

        ArgumentCaptor<Ballot> ballotCaptor = ArgumentCaptor.forClass(Ballot.class);
        verify(ballotRepository).save(ballotCaptor.capture());
        Ballot savedBallot = ballotCaptor.getValue();
        assertThat(savedBallot.getElections()).containsExactlyInAnyOrder(firstElection, secondElection);
        assertThat(savedBallot.getStartAt()).isEqualTo(START_AT);
        assertThat(savedBallot.getEndAt()).isEqualTo(END_AT);
        assertThat(response.id()).isEqualTo(savedBallot.getId());
        assertThat(response.elections()).containsExactlyInAnyOrder(
                electionResponse(firstElection),
                electionResponse(secondElection)
        );
        assertThat(response.isOpen()).isFalse();
        assertThat(response.startAt()).isEqualTo(START_AT);
        assertThat(response.endAt()).isEqualTo(END_AT);
    }

    private static ElectionResponseDto electionResponse(Election election) {
        return new ElectionResponseDto(election.getId(), election.getName(), election.getCreatedAt());
    }

    @Test
    void createRejectsStartAtEqualToEndAt() {
        CreateBallotDto request = new CreateBallotDto(Set.of(UUID.randomUUID()), START_AT, START_AT);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).isEqualTo("Selecione uma data de inicio menor que a de fim");
                });

        verify(ballotRepository, never()).save(any());
        verify(electionService, never()).findById(any());
    }

    @Test
    void createRejectsStartAtAfterEndAt() {
        CreateBallotDto request = new CreateBallotDto(Set.of(UUID.randomUUID()), END_AT, START_AT);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(ResponseStatusException.class);

        verify(ballotRepository, never()).save(any());
        verify(electionService, never()).findById(any());
    }

    @Test
    void findByIdReturnsExistingBallot() {
        Ballot ballot = ballot(UUID.randomUUID(), START_AT, END_AT);
        when(ballotRepository.findById(ballot.getId())).thenReturn(Optional.of(ballot));

        Ballot result = service.findById(ballot.getId());

        assertThat(result).isEqualTo(ballot);
    }

    @Test
    void findByIdRejectsMissingBallot() {
        UUID id = UUID.randomUUID();
        when(ballotRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(id))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(exception.getReason()).isEqualTo("Urna não encontrada");
                });
    }

    @Test
    void findByUserIdMapsBallotsToResponseDtos() {
        UUID userId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        Ballot first = ballot(UUID.randomUUID(), START_AT, END_AT);
        Ballot second = ballot(UUID.randomUUID(), START_AT.plusSeconds(3600), END_AT.plusSeconds(3600));
        when(ballotRepository.findByUserId(userId, pageable))
                .thenReturn(new PageImpl<>(List.of(first, second)));

        List<BallotResponseDto> result = service.findByUserId(userId, pageable).toList();

        verify(ballotRepository).findByUserId(userId, pageable);
        assertThat(result).containsExactly(first.toResponseDto(), second.toResponseDto());
    }

    @Test
    void deleteRemovesBallotThatHasNotStarted() {
        Ballot ballot = ballot(UUID.randomUUID(), Instant.now().plusSeconds(3600), Instant.now().plusSeconds(7200));
        when(ballotRepository.findById(ballot.getId())).thenReturn(Optional.of(ballot));

        service.delete(ballot.getId());

        verify(ballotRepository).delete(ballot);
    }

    @Test
    void deleteRejectsBallotThatAlreadyStarted() {
        Ballot ballot = ballot(UUID.randomUUID(), Instant.now().minusSeconds(60), Instant.now().plusSeconds(3600));
        when(ballotRepository.findById(ballot.getId())).thenReturn(Optional.of(ballot));

        assertThatThrownBy(() -> service.delete(ballot.getId()))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).isEqualTo("Não é possível deletar uma urna que já foi iniciada");
                });

        verify(ballotRepository, never()).delete(any());
    }
}

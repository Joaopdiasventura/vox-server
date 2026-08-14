package dev.joaopdias.vox.core.ballot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Method;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.PathVariable;

import dev.joaopdias.vox.core.ballot.dto.BallotResponseDto;
import dev.joaopdias.vox.core.ballot.dto.CreateBallotDto;
import dev.joaopdias.vox.core.ballot.entities.Ballot;
import dev.joaopdias.vox.core.election.dto.ElectionResponseDto;
import dev.joaopdias.vox.core.election.entities.Election;
import dev.joaopdias.vox.shared.security.AuthenticatedUser;

@ExtendWith(MockitoExtension.class)
class BallotControllerTest {
    private static final Instant START_AT = Instant.parse("2026-01-01T00:00:00Z");
    private static final Instant END_AT = Instant.parse("2026-01-02T00:00:00Z");

    @Mock
    private BallotService ballotService;

    private BallotController controller;

    @BeforeEach
    void setUp() {
        controller = new BallotController(ballotService);
    }

    @Test
    void createDelegatesToServiceAndReturnsResponse() {
        CreateBallotDto request = new CreateBallotDto(Set.of(UUID.randomUUID()), START_AT, END_AT);
        BallotResponseDto response = ballotResponse(Set.of(electionResponse(UUID.randomUUID())));
        when(ballotService.create(request)).thenReturn(response);

        BallotResponseDto result = controller.create(request);

        assertThat(result).isEqualTo(response);
        verify(ballotService).create(request);
    }

    @Test
    void findByUserIdDelegatesToServiceUsingAuthenticatedUserAndPageable() {
        AuthenticatedUser user = new AuthenticatedUser(UUID.randomUUID());
        Pageable pageable = PageRequest.of(1, 10);
        BallotResponseDto response = ballotResponse(Set.of(electionResponse(UUID.randomUUID())));
        Page<BallotResponseDto> page = new PageImpl<>(java.util.List.of(response), pageable, 1);
        when(ballotService.findByUserId(user.id(), pageable)).thenReturn(page);

        Page<BallotResponseDto> result = controller.findByUserId(user, pageable);

        assertThat(result).isEqualTo(page);
        verify(ballotService).findByUserId(user.id(), pageable);
    }

    @Test
    void findByIdReturnsBallotResponse() {
        Ballot ballot = ballot(UUID.randomUUID(), Set.of(election(UUID.randomUUID())), START_AT, END_AT);
        when(ballotService.findById(ballot.getId())).thenReturn(ballot);

        BallotResponseDto result = controller.findById(ballot.getId());

        assertThat(result).isEqualTo(ballot.toResponseDto());
        verify(ballotService).findById(ballot.getId());
    }

    @Test
    void findByIdUsesPathVariableBinding() throws NoSuchMethodException {
        Method method = BallotController.class.getMethod("findById", UUID.class);

        assertThat(method.getParameters()[0].isAnnotationPresent(PathVariable.class)).isTrue();
    }

    @Test
    void deleteDelegatesToServiceUsingPathId() {
        UUID id = UUID.randomUUID();

        controller.delete(id);

        verify(ballotService).delete(id);
    }

    private static BallotResponseDto ballotResponse(Set<ElectionResponseDto> elections) {
        return new BallotResponseDto(UUID.randomUUID(), elections, false, START_AT, END_AT);
    }

    private static ElectionResponseDto electionResponse(UUID id) {
        return new ElectionResponseDto(id, "Eleição 2026", START_AT);
    }

    private static Ballot ballot(UUID id, Set<Election> elections, Instant startAt, Instant endAt) {
        Ballot ballot = new Ballot();
        ballot.setId(id);
        ballot.setElections(elections);
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
}

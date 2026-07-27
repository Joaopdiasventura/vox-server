package dev.joaopdias.vox.core.election;

import dev.joaopdias.vox.core.election.dto.CreateElectionDto;
import dev.joaopdias.vox.core.election.dto.ElectionResponseDto;
import dev.joaopdias.vox.core.election.dto.UpdateElectionDto;
import dev.joaopdias.vox.core.election.entities.Election;
import dev.joaopdias.vox.shared.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ElectionControllerTest {
    private static final Instant CREATED_AT = Instant.parse("2026-01-01T00:00:00Z");

    @Mock
    private ElectionService electionService;

    private ElectionController controller;

    private static ElectionResponseDto electionResponse() {
        return new ElectionResponseDto(UUID.randomUUID(), "Eleição 2026", CREATED_AT);
    }

    private static Election election() {
        Election election = new Election();
        election.setId(UUID.randomUUID());
        election.setName("Eleição 2026");
        election.setCreatedAt(CREATED_AT);
        return election;
    }

    @BeforeEach
    void setUp() {
        controller = new ElectionController(electionService);
    }

    @Test
    void createDelegatesToServiceUsingAuthenticatedUserId() {
        UUID userId = UUID.randomUUID();
        CreateElectionDto request = new CreateElectionDto("Eleição 2026");
        ElectionResponseDto response = electionResponse();
        when(electionService.create(userId, request)).thenReturn(response);

        ElectionResponseDto result = controller.create(new AuthenticatedUser(userId), request);

        assertThat(result).isEqualTo(response);
        verify(electionService).create(userId, request);
    }

    @Test
    void findManyByUserDelegatesToServiceUsingAuthenticatedUserIdAndPageable() {
        UUID userId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(1, 10);
        ElectionResponseDto response = electionResponse();

        List<ElectionResponseDto> result = controller.findManyByUser(new AuthenticatedUser(userId), pageable).toList();

        assertThat(result).containsExactly(response);
        verify(electionService).findManyByUser(userId, pageable);
    }

    @Test
    void findByIdReturnsElectionResponse() {
        Election election = election();
        when(electionService.findById(election.getId())).thenReturn(election);

        ElectionResponseDto result = controller.findById(election.getId());

        assertThat(result).isEqualTo(election.toResponseDto());
        verify(electionService).findById(election.getId());
    }

    @Test
    void updateDelegatesToServiceUsingPathId() {
        UUID id = UUID.randomUUID();
        UpdateElectionDto request = new UpdateElectionDto("Eleição atualizada");

        controller.update(id, request);

        verify(electionService).update(id, request);
    }

    @Test
    void deleteDelegatesToServiceUsingPathId() {
        UUID id = UUID.randomUUID();

        controller.delete(id);

        verify(electionService).delete(id);
    }
}

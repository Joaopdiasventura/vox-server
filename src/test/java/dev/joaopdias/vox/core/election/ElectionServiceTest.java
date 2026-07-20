package dev.joaopdias.vox.core.election;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
import org.springframework.web.server.ResponseStatusException;

import dev.joaopdias.vox.core.election.dto.CreateElectionDto;
import dev.joaopdias.vox.core.election.dto.ElectionResponseDto;
import dev.joaopdias.vox.core.election.dto.UpdateElectionDto;
import dev.joaopdias.vox.core.election.entities.Election;
import dev.joaopdias.vox.core.user.UserService;
import dev.joaopdias.vox.core.user.entities.User;

@ExtendWith(MockitoExtension.class)
class ElectionServiceTest {
    private static final Instant CREATED_AT = Instant.parse("2026-01-01T00:00:00Z");

    @Mock
    private ElectionRepository electionRepository;

    @Mock
    private UserService userService;

    private ElectionService service;

    @BeforeEach
    void setUp() {
        service = new ElectionService(electionRepository, userService);
    }

    @Test
    void createPersistsElectionForUserAndReturnsResponse() {
        UUID userId = UUID.randomUUID();
        User user = user(userId);
        CreateElectionDto request = new CreateElectionDto("Eleição 2026");
        when(userService.findById(userId)).thenReturn(user);
        when(electionRepository.save(any(Election.class))).thenAnswer(invocation -> {
            Election election = invocation.getArgument(0);
            election.setId(UUID.randomUUID());
            election.setCreatedAt(CREATED_AT);
            return election;
        });

        ElectionResponseDto response = service.create(userId, request);

        ArgumentCaptor<Election> electionCaptor = ArgumentCaptor.forClass(Election.class);
        verify(electionRepository).save(electionCaptor.capture());
        Election savedElection = electionCaptor.getValue();
        assertThat(savedElection.getName()).isEqualTo(request.name());
        assertThat(savedElection.getUser()).isEqualTo(user);
        assertThat(response.id()).isEqualTo(savedElection.getId());
        assertThat(response.name()).isEqualTo(request.name());
        assertThat(response.createdAt()).isEqualTo(CREATED_AT);
    }

    @Test
    void findByIdReturnsExistingElection() {
        Election election = election(UUID.randomUUID(), "Eleição 2026");
        when(electionRepository.findById(election.getId())).thenReturn(Optional.of(election));

        Election result = service.findById(election.getId());

        assertThat(result).isEqualTo(election);
    }

    @Test
    void findByIdRejectsMissingElection() {
        UUID id = UUID.randomUUID();
        when(electionRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(id))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                assertThat(exception.getReason()).isEqualTo("Eleição não encontrada");
            });
    }

    @Test
    void findManyByUserChecksUserAndMapsElectionsToResponseDtos() {
        UUID userId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        Election first = election(UUID.randomUUID(), "Eleição A");
        Election second = election(UUID.randomUUID(), "Eleição B");
        when(electionRepository.findByUserId(userId, pageable)).thenReturn(new PageImpl<>(List.of(first, second)));

        List<ElectionResponseDto> result = service.findManyByUser(userId, pageable).toList();

        verify(userService).findById(userId);
        verify(electionRepository).findByUserId(userId, pageable);
        assertThat(result).containsExactly(first.toResponseDto(), second.toResponseDto());
    }

    @Test
    void updateChangesNameWhenProvided() {
        UUID id = UUID.randomUUID();
        Election election = election(id, "Eleição antiga");
        UpdateElectionDto request = new UpdateElectionDto("Eleição atualizada");
        when(electionRepository.findById(id)).thenReturn(Optional.of(election));

        service.update(id, request);

        assertThat(election.getName()).isEqualTo(request.name());
        verify(electionRepository).save(election);
    }

    @Test
    void updateKeepsNameWhenNullIsProvided() {
        UUID id = UUID.randomUUID();
        Election election = election(id, "Eleição antiga");
        UpdateElectionDto request = new UpdateElectionDto(null);
        when(electionRepository.findById(id)).thenReturn(Optional.of(election));

        service.update(id, request);

        assertThat(election.getName()).isEqualTo("Eleição antiga");
        verify(electionRepository).save(election);
    }

    @Test
    void updateRejectsMissingElectionBeforeSaving() {
        UUID id = UUID.randomUUID();
        when(electionRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, new UpdateElectionDto("Nova eleição")))
            .isInstanceOf(ResponseStatusException.class);

        verify(electionRepository, never()).save(any());
    }

    @Test
    void deleteRemovesExistingElection() {
        Election election = election(UUID.randomUUID(), "Eleição 2026");
        when(electionRepository.findById(election.getId())).thenReturn(Optional.of(election));

        service.delete(election.getId());

        verify(electionRepository).delete(election);
    }

    private static Election election(UUID id, String name) {
        Election election = new Election();
        election.setId(id);
        election.setName(name);
        election.setCreatedAt(CREATED_AT);
        return election;
    }

    private static User user(UUID id) {
        User user = new User();
        user.setId(id);
        user.setEmail("ana@example.com");
        user.setName("Ana");
        user.setPassword("hashed-password");
        user.setCreatedAt(CREATED_AT);
        user.setIsValidated(true);
        return user;
    }
}

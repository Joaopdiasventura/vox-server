package dev.joaopdias.vox.core.candidate;

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

import dev.joaopdias.vox.core.candidate.dto.CandidateResponseDto;
import dev.joaopdias.vox.core.candidate.dto.CreateCandidateDto;
import dev.joaopdias.vox.core.candidate.dto.UpdateCandidateDto;
import dev.joaopdias.vox.core.candidate.entities.Candidate;
import dev.joaopdias.vox.core.election.ElectionService;
import dev.joaopdias.vox.core.election.entities.Election;

@ExtendWith(MockitoExtension.class)
class CandidateServiceTest {
    private static final Instant CREATED_AT = Instant.parse("2026-01-01T00:00:00Z");

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private ElectionService electionService;

    private CandidateService service;

    @BeforeEach
    void setUp() {
        service = new CandidateService(candidateRepository, electionService);
    }

    @Test
    void createPersistsCandidateForElectionAndReturnsResponse() {
        UUID electionId = UUID.randomUUID();
        Election election = election(electionId);
        CreateCandidateDto request = new CreateCandidateDto("Ana", electionId);
        when(electionService.findById(electionId)).thenReturn(election);
        when(candidateRepository.save(any(Candidate.class))).thenAnswer(invocation -> {
            Candidate candidate = invocation.getArgument(0);
            candidate.setId(UUID.randomUUID());
            candidate.setCreatedAt(CREATED_AT);
            return candidate;
        });

        CandidateResponseDto response = service.create(request);

        ArgumentCaptor<Candidate> candidateCaptor = ArgumentCaptor.forClass(Candidate.class);
        verify(candidateRepository).save(candidateCaptor.capture());
        Candidate savedCandidate = candidateCaptor.getValue();
        assertThat(savedCandidate.getName()).isEqualTo(request.name());
        assertThat(savedCandidate.getElection()).isEqualTo(election);
        assertThat(response.id()).isEqualTo(savedCandidate.getId());
        assertThat(response.name()).isEqualTo(request.name());
        assertThat(response.createdAt()).isEqualTo(CREATED_AT);
    }

    @Test
    void findByIdReturnsExistingCandidate() {
        Candidate candidate = candidate(UUID.randomUUID(), "Ana");
        when(candidateRepository.findById(candidate.getId())).thenReturn(Optional.of(candidate));

        Candidate result = service.findById(candidate.getId());

        assertThat(result).isEqualTo(candidate);
    }

    @Test
    void findByIdRejectsMissingCandidate() {
        UUID id = UUID.randomUUID();
        when(candidateRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(id))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                assertThat(exception.getReason()).isEqualTo("Candidato não encontrado");
            });
    }

    @Test
    void findManyByElectionChecksElectionAndMapsCandidatesToResponseDtos() {
        UUID electionId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        Candidate first = candidate(UUID.randomUUID(), "Ana");
        Candidate second = candidate(UUID.randomUUID(), "João");
        when(candidateRepository.findManyByElectionId(electionId, pageable))
            .thenReturn(new PageImpl<>(List.of(first, second)));

        List<CandidateResponseDto> result = service.findManyByElection(electionId, pageable).toList();

        verify(electionService).findById(electionId);
        verify(candidateRepository).findManyByElectionId(electionId, pageable);
        assertThat(result).containsExactly(first.toResponseDto(), second.toResponseDto());
    }

    @Test
    void updateChangesNameWhenProvided() {
        UUID id = UUID.randomUUID();
        Candidate candidate = candidate(id, "Ana");
        UpdateCandidateDto request = new UpdateCandidateDto("Ana atualizada");
        when(candidateRepository.findById(id)).thenReturn(Optional.of(candidate));

        service.update(id, request);

        assertThat(candidate.getName()).isEqualTo(request.name());
        verify(candidateRepository).save(candidate);
    }

    @Test
    void updateKeepsNameWhenNullIsProvided() {
        UUID id = UUID.randomUUID();
        Candidate candidate = candidate(id, "Ana");
        UpdateCandidateDto request = new UpdateCandidateDto(null);
        when(candidateRepository.findById(id)).thenReturn(Optional.of(candidate));

        service.update(id, request);

        assertThat(candidate.getName()).isEqualTo("Ana");
        verify(candidateRepository).save(candidate);
    }

    @Test
    void updateRejectsMissingCandidateBeforeSaving() {
        UUID id = UUID.randomUUID();
        when(candidateRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, new UpdateCandidateDto("Nova candidata")))
            .isInstanceOf(ResponseStatusException.class);

        verify(candidateRepository, never()).save(any());
    }

    @Test
    void deleteRemovesExistingCandidate() {
        Candidate candidate = candidate(UUID.randomUUID(), "Ana");
        when(candidateRepository.findById(candidate.getId())).thenReturn(Optional.of(candidate));

        service.delete(candidate.getId());

        verify(candidateRepository).delete(candidate);
    }

    private static Candidate candidate(UUID id, String name) {
        Candidate candidate = new Candidate();
        candidate.setId(id);
        candidate.setName(name);
        candidate.setCreatedAt(CREATED_AT);
        return candidate;
    }

    private static Election election(UUID id) {
        Election election = new Election();
        election.setId(id);
        election.setName("Eleição 2026");
        election.setCreatedAt(CREATED_AT);
        return election;
    }
}

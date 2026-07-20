package dev.joaopdias.vox.core.candidate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Method;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.PathVariable;

import dev.joaopdias.vox.core.candidate.dto.CandidateResponseDto;
import dev.joaopdias.vox.core.candidate.dto.CreateCandidateDto;
import dev.joaopdias.vox.core.candidate.dto.UpdateCandidateDto;
import dev.joaopdias.vox.core.candidate.entities.Candidate;

@ExtendWith(MockitoExtension.class)
class CandidateControllerTest {
    private static final Instant CREATED_AT = Instant.parse("2026-01-01T00:00:00Z");

    @Mock
    private CandidateService candidateService;

    private CandidateController controller;

    @BeforeEach
    void setUp() {
        controller = new CandidateController(candidateService);
    }

    @Test
    void createDelegatesToServiceAndReturnsResponse() {
        CreateCandidateDto request = new CreateCandidateDto("Ana", UUID.randomUUID());
        CandidateResponseDto response = candidateResponse("Ana");
        when(candidateService.create(request)).thenReturn(response);

        CandidateResponseDto result = controller.create(request);

        assertThat(result).isEqualTo(response);
        verify(candidateService).create(request);
    }

    @Test
    void findManyByElectionDelegatesToServiceUsingElectionIdAndPageable() {
        UUID electionId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(1, 10);
        CandidateResponseDto response = candidateResponse("Ana");
        when(candidateService.findManyByElection(electionId, pageable)).thenReturn(Stream.of(response));

        List<CandidateResponseDto> result = controller.findManyByElection(electionId, pageable).toList();

        assertThat(result).containsExactly(response);
        verify(candidateService).findManyByElection(electionId, pageable);
    }

    @Test
    void findByIdReturnsCandidateResponse() {
        Candidate candidate = candidate(UUID.randomUUID(), "Ana");
        when(candidateService.findById(candidate.getId())).thenReturn(candidate);

        CandidateResponseDto result = controller.findById(candidate.getId());

        assertThat(result).isEqualTo(candidate.toResponseDto());
        verify(candidateService).findById(candidate.getId());
    }

    @Test
    void findByIdUsesPathVariableBinding() throws NoSuchMethodException {
        Method method = CandidateController.class.getMethod("findById", UUID.class);

        assertThat(method.getParameters()[0].isAnnotationPresent(PathVariable.class)).isTrue();
    }

    @Test
    void updateDelegatesToServiceUsingPathId() {
        UUID id = UUID.randomUUID();
        UpdateCandidateDto request = new UpdateCandidateDto("Ana atualizada");

        controller.update(id, request);

        verify(candidateService).update(id, request);
    }

    @Test
    void deleteDelegatesToServiceUsingPathId() {
        UUID id = UUID.randomUUID();

        controller.delete(id);

        verify(candidateService).delete(id);
    }

    private static CandidateResponseDto candidateResponse(String name) {
        return new CandidateResponseDto(UUID.randomUUID(), name, CREATED_AT);
    }

    private static Candidate candidate(UUID id, String name) {
        Candidate candidate = new Candidate();
        candidate.setId(id);
        candidate.setName(name);
        candidate.setCreatedAt(CREATED_AT);
        return candidate;
    }
}

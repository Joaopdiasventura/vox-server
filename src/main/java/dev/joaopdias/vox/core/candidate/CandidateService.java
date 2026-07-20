package dev.joaopdias.vox.core.candidate;

import dev.joaopdias.vox.core.candidate.dto.CandidateResponseDto;
import dev.joaopdias.vox.core.candidate.dto.CreateCandidateDto;
import dev.joaopdias.vox.core.candidate.dto.UpdateCandidateDto;
import dev.joaopdias.vox.core.candidate.entities.Candidate;
import dev.joaopdias.vox.core.election.ElectionService;
import dev.joaopdias.vox.core.election.entities.Election;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;
import java.util.stream.Stream;

@Service
public class CandidateService {
    private final CandidateRepository candidateRepository;

    private final ElectionService electionService;

    public CandidateService(
            CandidateRepository candidateRepository,
            ElectionService electionService
    ){
        this.candidateRepository = candidateRepository;
        this.electionService = electionService;
    }

    public CandidateResponseDto create(CreateCandidateDto createCandidateDto){
        Election election = this.electionService.findById(createCandidateDto.electionId());

        Candidate candidate = new Candidate();

        candidate.setName(createCandidateDto.name());
        candidate.setElection(election);

        this.candidateRepository.save(candidate);

        return candidate.toResponseDto();
    }

    public Candidate findById(UUID id){
        return this.candidateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidato não encontrado"));
    }

    public Stream<CandidateResponseDto> findManyByElection(UUID electionId, Pageable pageable){
        this.electionService.findById(electionId);
        return this.candidateRepository
                .findManyByElectionId(electionId, pageable).stream().map(Candidate::toResponseDto);
    }

    public void update(UUID id, UpdateCandidateDto updateCandidateDto){
        Candidate candidate = this.findById(id);

        if (updateCandidateDto.name() != null) candidate.setName(updateCandidateDto.name());

        this.candidateRepository.save(candidate);
    }

    public void delete(UUID id){
        Candidate candidate = this.findById(id);
        this.candidateRepository.delete(candidate);

    }
}

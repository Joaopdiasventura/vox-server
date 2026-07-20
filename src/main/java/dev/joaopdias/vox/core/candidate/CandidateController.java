package dev.joaopdias.vox.core.candidate;

import dev.joaopdias.vox.core.candidate.dto.CandidateResponseDto;
import dev.joaopdias.vox.core.candidate.dto.CreateCandidateDto;
import dev.joaopdias.vox.core.candidate.dto.UpdateCandidateDto;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.stream.Stream;

@RestController
@RequestMapping("/candidate")
public class CandidateController {
    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService){
        this.candidateService = candidateService;
    }

    @PostMapping()
    public CandidateResponseDto create(@RequestBody CreateCandidateDto createCandidateDto){
        return this.candidateService.create(createCandidateDto);
    }

    @GetMapping("/election/{electionId}")
    public Stream<CandidateResponseDto> findManyByElection(
            @PathVariable UUID electionId,
            Pageable pageable
    ){
        return this.candidateService.findManyByElection(electionId, pageable);
    }

    @GetMapping("/{id}")
    public CandidateResponseDto findById(@PathVariable UUID id){
        return this.candidateService.findById(id).toResponseDto();
    }

    @PatchMapping("/{id}")
    public void update(
            @PathVariable UUID id,
            @RequestBody UpdateCandidateDto updateCandidateDto
    ){
        this.candidateService.update(id, updateCandidateDto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id){
        this.candidateService.delete(id);
    }
}

package dev.joaopdias.vox.core.election;

import dev.joaopdias.vox.core.election.dto.CreateElectionDto;
import dev.joaopdias.vox.core.election.dto.ElectionResponseDto;
import dev.joaopdias.vox.core.election.dto.UpdateElectionDto;
import dev.joaopdias.vox.shared.security.AuthenticatedUser;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.stream.Stream;

@RestController
@RequestMapping("/election")
public class ElectionController {
    private final ElectionService electionService;

    public ElectionController(ElectionService electionService) {
        this.electionService = electionService;
    }

    @PostMapping()
    public ElectionResponseDto create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody CreateElectionDto createElectionDto
    ) {
        return this.electionService.create(user.id(), createElectionDto);
    }

    @GetMapping()
    public Stream<ElectionResponseDto> findManyByUser(
            @AuthenticationPrincipal AuthenticatedUser user,
            Pageable pageable
    ) {
        return this.electionService.findManyByUser(user.id(), pageable);
    }

    @GetMapping("/{id}")
    public ElectionResponseDto findById(@PathVariable UUID id) {
        return this.electionService.findById(id).toResponseDto();
    }

    @PatchMapping("/{id}")
    public void update(
            @PathVariable UUID id,
            @RequestBody UpdateElectionDto updateElectionDto
    ) {
        this.electionService.update(id, updateElectionDto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id){
        this.electionService.delete(id);
    }
}

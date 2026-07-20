package dev.joaopdias.vox.core.ballot;

import dev.joaopdias.vox.core.ballot.dto.BallotResponseDto;
import dev.joaopdias.vox.core.ballot.dto.CreateBallotDto;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

@RestController
@RequestMapping("/ballot")
public class BallotController {
    private final BallotService ballotService;

    public BallotController(BallotService ballotService) {
        this.ballotService = ballotService;
    }

    @PostMapping()
    public BallotResponseDto create(@RequestBody CreateBallotDto createBallotDto) {
        return this.ballotService.create(createBallotDto);
    }

    @GetMapping("/elections/{electionsId}")
    public Stream<BallotResponseDto> findByElections(
            @PathVariable Set<UUID> electionsId,
            Pageable pageable
    ) {
        return this.ballotService.findByElections(electionsId, pageable);
    }

    @GetMapping("/{id}")
    public BallotResponseDto findById(@PathVariable UUID id) {
        return this.ballotService.findById(id).toResponseDto();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        this.ballotService.delete(id);
    }
}

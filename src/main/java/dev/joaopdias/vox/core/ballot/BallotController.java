package dev.joaopdias.vox.core.ballot;

import dev.joaopdias.vox.core.ballot.dto.BallotResponseDto;
import dev.joaopdias.vox.core.ballot.dto.CreateBallotDto;
import dev.joaopdias.vox.shared.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

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

    @GetMapping()
    public Page<BallotResponseDto> findByUserId(
            @AuthenticationPrincipal AuthenticatedUser user,
            Pageable pageable
    ) {
        return this.ballotService.findByUserId(user.id(), pageable);
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

package dev.joaopdias.vox.core.vote;

import dev.joaopdias.vox.core.vote.dto.CreateVoteDto;
import dev.joaopdias.vox.core.vote.dto.VoteResultDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vote")
public class VoteController {
    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping()
    public String create(@RequestBody CreateVoteDto createVoteDto){
        return this.voteService.create(createVoteDto);
    }

    @GetMapping("/election/{electionId}/ballot/{ballotId}")
    public List<VoteResultDto> findResult(
            @PathVariable UUID electionId,
            @PathVariable UUID ballotId
    ){
        return this.voteService.findResult(electionId, ballotId);
    }
}

package dev.joaopdias.vox.core.vote;

import dev.joaopdias.vox.core.ballot.BallotService;
import dev.joaopdias.vox.core.ballot.entities.Ballot;
import dev.joaopdias.vox.core.candidate.CandidateService;
import dev.joaopdias.vox.core.candidate.entities.Candidate;
import dev.joaopdias.vox.core.vote.dto.CreateVoteDto;
import dev.joaopdias.vox.core.vote.dto.VoteResultDto;
import dev.joaopdias.vox.core.vote.entities.Vote;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class VoteService {
    private final VoteRepository voteRepository;

    private final CandidateService candidateService;

    private final BallotService ballotService;

    public VoteService(
            VoteRepository voteRepository,
            CandidateService candidateService,
            BallotService ballotService
    ) {
        this.voteRepository = voteRepository;
        this.candidateService = candidateService;
        this.ballotService = ballotService;
    }

    @Transactional()
    public String create(CreateVoteDto createVoteDto) {
        Candidate candidate = this.candidateService.findById(createVoteDto.candidateId());

        Ballot ballot = this.ballotService.findByIdLocked(createVoteDto.ballotId());

        if (!ballot.getIsOpen())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A urna não está aberta"
            );

        Instant now = new Date().toInstant();

        if (now.compareTo(ballot.getStartAt()) < 0)
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Essa votação ainda não iniciou"
            );

        if (now.compareTo(ballot.getEndAt()) > 0)
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Essa votação já encerrou"
            );

        Vote vote = new Vote();

        vote.setCandidate(candidate);
        vote.setBallot(ballot);

        this.voteRepository.save(vote);

        this.ballotService.changeState(createVoteDto.ballotId(), Boolean.FALSE);

        return "Voto registrado com sucesso";
    }

    @Transactional(readOnly = true)
    public List<VoteResultDto> findResult(UUID electionId, UUID ballotId){
        return this.voteRepository.findResult(electionId, ballotId);
    }
}

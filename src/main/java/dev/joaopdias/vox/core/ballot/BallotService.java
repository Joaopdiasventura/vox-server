package dev.joaopdias.vox.core.ballot;

import dev.joaopdias.vox.core.ballot.dto.BallotResponseDto;
import dev.joaopdias.vox.core.ballot.dto.CreateBallotDto;
import dev.joaopdias.vox.core.ballot.entities.Ballot;
import dev.joaopdias.vox.core.ballot.events.BallotEvent;
import dev.joaopdias.vox.core.ballot.types.BallotEventType;
import dev.joaopdias.vox.core.election.ElectionService;
import dev.joaopdias.vox.core.election.entities.Election;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Date;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BallotService {
    private final BallotRepository ballotRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final ElectionService electionService;

    public BallotService(
            BallotRepository ballotRepository,
            SimpMessagingTemplate messagingTemplate,
            ElectionService electionService
    ) {
        this.ballotRepository = ballotRepository;
        this.messagingTemplate = messagingTemplate;
        this.electionService = electionService;
    }

    public BallotResponseDto create(CreateBallotDto createBallotDto) {

        if (createBallotDto.startAt().compareTo(createBallotDto.endAt()) >= 0)
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecione uma data de inicio menor que a de fim"
            );

        Set<Election> elections = createBallotDto.electionsId()
                .stream()
                .map(this.electionService::findById)
                .collect(Collectors.toSet());

        Ballot ballot = new Ballot();

        ballot.setElections(elections);
        ballot.setStartAt(createBallotDto.startAt());
        ballot.setEndAt(createBallotDto.endAt());

        this.ballotRepository.save(ballot);

        return ballot.toResponseDto();
    }

    public Ballot findById(UUID id) {
        return this.ballotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Urna não encontrada"));
    }

    public Ballot findByIdLocked(UUID id) {
        return this.ballotRepository.findByIdLocked(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Urna não encontrada"));
    }

    public Page<BallotResponseDto> findByUserId(UUID userId, Pageable pageable) {
        return this.ballotRepository.findByUserId(userId, pageable)
                .map(Ballot::toResponseDto);
    }

    @Transactional()
    public void changeState(UUID id, Boolean isOpen) {
        Ballot ballot = this.findById(id);
        ballot.setIsOpen(isOpen);

        BallotEvent event = new BallotEvent(
                id,
                isOpen ? BallotEventType.OPENED : BallotEventType.CLOSED,
                Instant.now()
        );

        this.ballotRepository.save(ballot);

        this.messagingTemplate.convertAndSend(
                "/topic/ballot/" + id,
                event
        );
    }

    public void delete(UUID id) {
        Ballot ballot = this.findById(id);
        Instant now = new Date().toInstant();

        if (now.compareTo(ballot.getStartAt()) >= 0)
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Não é possível deletar uma urna que já foi iniciada"
            );

        this.ballotRepository.delete(ballot);
    }
}

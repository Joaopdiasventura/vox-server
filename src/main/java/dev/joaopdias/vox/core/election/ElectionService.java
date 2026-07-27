package dev.joaopdias.vox.core.election;

import dev.joaopdias.vox.core.election.dto.CreateElectionDto;
import dev.joaopdias.vox.core.election.dto.ElectionResponseDto;
import dev.joaopdias.vox.core.election.dto.UpdateElectionDto;
import dev.joaopdias.vox.core.election.entities.Election;
import dev.joaopdias.vox.core.user.UserService;
import dev.joaopdias.vox.core.user.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class ElectionService {
    private final ElectionRepository electionRepository;
    private final UserService userService;

    public ElectionService(
            ElectionRepository electionRepository,
            UserService userService
    ) {
        this.electionRepository = electionRepository;
        this.userService = userService;
    }

    public ElectionResponseDto create(UUID userId, CreateElectionDto createElectionDto) {
        User user = this.userService.findById(userId);

        Election election = new Election();

        election.setName(createElectionDto.name());
        election.setUser(user);

        this.electionRepository.save(election);

        return election.toResponseDto();
    }

    public Election findById(UUID id) {
        return this.electionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Eleição não encontrada"));
    }

    public Page<ElectionResponseDto> findManyByUser(UUID userId, Pageable pageable) {
        this.userService.findById(userId);
        return this.electionRepository.findByUserId(userId, pageable).map(Election::toResponseDto);
    }

    public void update(UUID id, UpdateElectionDto updateElectionDto) {
        Election election = this.findById(id);

        if (updateElectionDto.name() != null) election.setName(updateElectionDto.name());

        this.electionRepository.save(election);
    }

    public void delete(UUID id) {
        Election election = this.findById(id);
        this.electionRepository.delete(election);
    }
}

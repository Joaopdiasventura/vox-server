package dev.joaopdias.vox.core.candidate;

import dev.joaopdias.vox.core.candidate.entities.Candidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
    Page<Candidate> findManyByElectionId(UUID id, Pageable pageable);
}

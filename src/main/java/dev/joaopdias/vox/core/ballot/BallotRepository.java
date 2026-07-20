package dev.joaopdias.vox.core.ballot;

import dev.joaopdias.vox.core.ballot.entities.Ballot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Set;
import java.util.UUID;

public interface BallotRepository extends JpaRepository<Ballot, UUID> {
    Page<Ballot> findManyByElectionsId(Set<UUID> electionsId, Pageable pageable);
}

package dev.joaopdias.vox.core.election;

import org.springframework.data.domain.Page;
import dev.joaopdias.vox.core.election.entities.Election;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ElectionRepository  extends JpaRepository<Election, UUID> {
    Page<Election> findByUserId(UUID userId, Pageable pageable);
}

package dev.joaopdias.vox.core.ballot;

import dev.joaopdias.vox.core.ballot.entities.Ballot;
import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface BallotRepository extends JpaRepository<Ballot, UUID> {
    @Query(
            value = """
                    SELECT DISTINCT b
                    FROM Ballot b
                    JOIN b.elections e
                    WHERE e.user.id = :userId
                    """,
            countQuery = """
                    SELECT COUNT(DISTINCT b.id)
                    FROM Ballot b
                    JOIN b.elections e
                    WHERE e.user.id = :userId
                    """
    )
    Page<Ballot> findByUserId(
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Ballot b WHERE b.id = :id")
Optional<Ballot> findByIdLocked(UUID id);
}

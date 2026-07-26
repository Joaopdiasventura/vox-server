package dev.joaopdias.vox.core.vote;

import dev.joaopdias.vox.core.vote.dto.VoteResultDto;
import dev.joaopdias.vox.core.vote.entities.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface VoteRepository extends JpaRepository<Vote, UUID> {
    @Query("""
            SELECT new dev.joaopdias.vox.core.vote.dto.VoteResultDto(
                COUNT(v.id),
                v.candidate
            )
            FROM Vote v
            JOIN v.ballot b
            JOIN b.elections e
            WHERE b.id = :ballotId
              AND e.id = :electionId
            GROUP BY v.candidate
            ORDER BY COUNT(v.id) DESC
            """)
    List<VoteResultDto> findResult(
            @Param("electionId") UUID electionId,
            @Param("ballotId") UUID ballotId
    );
}

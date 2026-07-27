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
                new dev.joaopdias.vox.core.candidate.dto.CandidateResponseDto(
                    v.candidate.id,
                    v.candidate.name,
                    v.candidate.createdAt
                )
            )
            FROM Vote v
            JOIN v.candidate c
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

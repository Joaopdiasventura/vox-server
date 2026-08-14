package dev.joaopdias.vox.core.vote.entities;

import dev.joaopdias.vox.core.ballot.entities.Ballot;
import dev.joaopdias.vox.core.candidate.entities.Candidate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "votes",
        indexes = {
                @Index(name = "idx_vote_candidate_ballot_id", columnList = "fk_candidate_id, fk_ballot_id")
        }
)
public class Vote {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "fk_candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "fk_ballot_id", nullable = false)
    private Ballot ballot;

    @Column(nullable = false, name = "created_at")
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}

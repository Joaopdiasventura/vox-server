package dev.joaopdias.vox.core.ballot.entities;


import dev.joaopdias.vox.core.ballot.dto.BallotResponseDto;
import dev.joaopdias.vox.core.election.entities.Election;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "ballots")
@NoArgsConstructor
@AllArgsConstructor
public class Ballot {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "ballot_election",
            joinColumns = @JoinColumn(name = "fk_ballot_id"),
            inverseJoinColumns = @JoinColumn(name = "fk_election_id")
    )
    private Set<Election> elections;

    @Column(nullable = false, name = "start_at")
    private Instant startAt;

    @Column(nullable = false, name = "end_at")
    private Instant endAt;

    public BallotResponseDto toResponseDto() {
        return new BallotResponseDto(
                this.id,
                this.elections,
                this.startAt,
                this.endAt
        );
    }
}

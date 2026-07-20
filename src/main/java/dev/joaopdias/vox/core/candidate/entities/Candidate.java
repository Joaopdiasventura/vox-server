package dev.joaopdias.vox.core.candidate.entities;

import dev.joaopdias.vox.core.candidate.dto.CandidateResponseDto;
import dev.joaopdias.vox.core.election.entities.Election;
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
@Table(name = "elections")
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_election_id")
    private Election election;

    @Column(nullable=false, name="created_at")
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    public CandidateResponseDto toResponseDto(){
        return new CandidateResponseDto(
                this.id,
                this.name,
                this.createdAt
        );
    }
}

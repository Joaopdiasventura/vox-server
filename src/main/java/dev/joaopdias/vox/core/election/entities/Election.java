package dev.joaopdias.vox.core.election.entities;

import dev.joaopdias.vox.core.election.dto.ElectionResponseDto;
import dev.joaopdias.vox.core.user.entities.User;
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
        name = "elections",
        indexes = {
                @Index(name = "idx__election_user_id", columnList = "fk_user_id")
        }
)
public class Election {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_user_id")
    private User user;

    @Column(nullable = false, name = "created_at")
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    public ElectionResponseDto toResponseDto() {
        return new ElectionResponseDto(
                this.id,
                this.name,
                this.createdAt
        );
    }
}

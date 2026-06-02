package dev.joaopdias.vox.core.user.entities;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import dev.joaopdias.vox.core.user.dto.UserResponseDto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable=false, unique=true)
    private String email;

    @Column(nullable=false, length=150)
    private String name;

    @Column(nullable=false)
    private String password;

    @Column(nullable=false, name="created_at")
    private Instant createdAt;

    @Column(nullable=false, name="is_validated")
    private Boolean isValidated;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.isValidated = Boolean.FALSE;
    }

    public UserResponseDto toResponseDto() {
        return new UserResponseDto(
            this.email,
            this.name,
            this.createdAt
        );
    }
}
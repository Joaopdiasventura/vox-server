package dev.joaopdias.vox.core.vote.entities;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import org.junit.jupiter.api.Test;

class VoteTest {
    @Test
    void prePersistInitializesCreationDate() {
        Vote vote = new Vote();
        Instant before = Instant.now();

        vote.prePersist();

        assertThat(vote.getCreatedAt()).isBetween(before, Instant.now());
    }
}

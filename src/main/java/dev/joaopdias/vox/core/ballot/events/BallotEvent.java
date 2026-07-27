package dev.joaopdias.vox.core.ballot.events;

import dev.joaopdias.vox.core.ballot.types.BallotEventType;

import java.time.Instant;
import java.util.UUID;

public record BallotEvent(
        UUID ballotId,
        BallotEventType type,
        Instant occurredAt
) {
}
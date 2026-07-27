package dev.joaopdias.vox.core.ballot;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@MessageMapping("/ballot/{id}")
public class BallotGateway {
    private final BallotService ballotService;

    public BallotGateway(BallotService ballotService) {
        this.ballotService = ballotService;
    }

    @MessageMapping("/open")
    public void openBallot(@DestinationVariable UUID id) {
        ballotService.changeState(id, true);
    }

    @MessageMapping("/close")
    public void closeBallot(@DestinationVariable UUID id) {
        ballotService.changeState(id, false);
    }
}

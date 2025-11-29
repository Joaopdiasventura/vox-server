import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Vote } from './entities/vote.entity';

@WebSocketGateway()
export class VoteGateway {
  @WebSocketServer()
  private server: Server;

  public onVoteCreated(vote: Vote): void {
    this.server.emit(`vote-${vote.session as unknown as string}`, vote);
  }
}

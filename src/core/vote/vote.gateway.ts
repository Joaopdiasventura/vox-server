import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Vote } from "./entities/vote.entity";

@WebSocketGateway()
export class VoteGateway {
  @WebSocketServer()
  private server: Server;

  private readonly clientsMap = new Map<string, string>();

  private generateSimpleId(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 5; i++)
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    return result;
  }

  public handleConnection(client: Socket): void {
    const realId = client.id;
    let simpleId = this.generateSimpleId();
    while (this.clientsMap.get(simpleId)) simpleId = this.generateSimpleId();
    this.clientsMap.set(simpleId, realId);
    client.emit("new-id", simpleId);
  }

  @SubscribeMessage("allow-vote")
  public allowVote(client: Socket, urnId: string): void {
    const id = this.clientsMap.get(urnId);
    if (id) client.to(id).emit("vote-allowed");
  }

  @SubscribeMessage("exit-poll")
  public exitPool(_: Socket, pool: string): void {
    this.server.emit(`exit-${pool}`);
  }

  public sendVote(vote: Vote): void {
    this.server.emit(`vote-${vote.pool as unknown as string}`, {
      candidate: vote.candidate,
    });
  }

  public handleDisconnect(client: Socket): void {
    const realId = client.id;
    const simpleId = [...this.clientsMap].find(
      ([, value]) => value == realId,
    )?.[0];
    if (simpleId) this.clientsMap.delete(simpleId);
  }
}

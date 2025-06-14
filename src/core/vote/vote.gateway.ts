import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SendVote } from "../../shared/interfaces/send-vote";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "*",
  },
})
export class VoteGateway implements OnGatewayConnection, OnGatewayDisconnect {
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

  public async handleConnection(socket: Socket): Promise<void> {
    const realId = socket.id;
    let simpleId = this.generateSimpleId();
    while (this.clientsMap.get(simpleId)) simpleId = this.generateSimpleId();
    this.clientsMap.set(simpleId, realId);
    socket.emit("new-id", simpleId);
  }

  @SubscribeMessage("allow-vote")
  public allowVote(socket: Socket, urnId: string): void {
    const id = this.clientsMap.get(urnId);
    socket.to(id).emit("vote-allowed");
  }

  @SubscribeMessage("send-vote")
  public sendVote(_: Socket, vote: SendVote): void {
    this.server.emit(`vote-${vote.group}`, {
      participant: vote.participant,
    });
  }

  @SubscribeMessage("exit-vote")
  public exitVote(_: Socket, group: string): void {
    this.server.emit(`exit-${group}`);
  }

  public handleDisconnect(socket: Socket): void {
    const realId = socket.id;
    const simpleId = [...this.clientsMap].find(
      ([, value]) => value == realId,
    )?.[0];
    if (simpleId) this.clientsMap.delete(simpleId);
  }
}

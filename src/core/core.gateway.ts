import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from "@nestjs/websockets";
import {  Socket } from "socket.io";
import { SendVote } from "../shared/interfaces/send-vote";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "*",
  },
})
export class CoreGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
  public allowVote(socket: Socket, payload: string): void {
    const id = this.clientsMap.get(payload);
    socket.to(id).emit("vote-allowed");
  }

  @SubscribeMessage("send-vote")
  public sendVote(socket: Socket, payload: SendVote): void {
    socket.emit(`vote-${payload.group}`, {
      participant: payload.participant,
    });
  }

  public handleDisconnect(socket: Socket): void {
    const realId = socket.id;
    const simpleId = [...this.clientsMap].find(
      ([, value]) => value == realId,
    )?.[0];
    if (simpleId) this.clientsMap.delete(simpleId);
  }
}

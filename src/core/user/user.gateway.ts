import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
  },
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private readonly userConnections = new Map<string, string[]>();

  public handleConnection(client: Socket): void {
    const userEmail = client.handshake.query.email as string;
    const socketIds = this.userConnections.get(userEmail);
    this.userConnections.set(
      userEmail,
      socketIds ? [...socketIds, client.id] : [client.id],
    );
  }

  public handleDisconnect(client: Socket): void {
    this.userConnections.forEach((socketIds, userEmail) => {
      const index = socketIds.indexOf(client.id);
      if (index != -1) {
        socketIds.splice(index, 1);
        if (socketIds.length == 0) this.userConnections.delete(userEmail);
        else this.userConnections.set(userEmail, socketIds);
      }
    });
  }

  public validateEmail(email: string): void {
    const socketIds = this.userConnections.get(email);
    if (socketIds) {
      for (const socketId of socketIds)
        this.server.to(socketId).emit("account-validated");
      this.userConnections.delete(email);
    }
  }
}

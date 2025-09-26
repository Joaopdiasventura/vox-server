import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class PaymentGateway {
  @WebSocketServer()
  private server: Server;

  private readonly userConnections = new Map<string, string[]>();

  public handleConnection(client: Socket): void {
    const userOrder = client.handshake.query.order as string;
    const socketIds = this.userConnections.get(userOrder);
    this.userConnections.set(
      userOrder,
      socketIds ? [...socketIds, client.id] : [client.id],
    );
  }

  public handleDisconnect(client: Socket): void {
    this.userConnections.forEach((socketIds, userOrder) => {
      const index = socketIds.indexOf(client.id);
      if (index != -1) {
        socketIds.splice(index, 1);
        if (socketIds.length == 0) this.userConnections.delete(userOrder);
        else this.userConnections.set(userOrder, socketIds);
      }
    });
  }

  public orderPaid(order: string): void {
    const socketIds = this.userConnections.get(order);
    if (!socketIds) return;
    for (const socketId of socketIds)
      this.server.to(socketId).emit("order-paid");
    this.userConnections.delete(order);
  }
}

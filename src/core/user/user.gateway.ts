import { Inject } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  public constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  public async handleConnection(client: Socket): Promise<void> {
    const userEmail = String(client.handshake.query.email || "").trim();
    if (!userEmail) return;
    const socketIds =
      (await this.cache.get<string[]>(this.userKey(userEmail))) || [];
    socketIds.push(client.id);
    await this.cache.set(this.userKey(userEmail), socketIds);
    await this.addActiveEmail(userEmail);
  }

  public async handleDisconnect(client: Socket): Promise<void> {
    const emails = await this.getActiveEmails();
    for (const email of emails) {
      const key = this.userKey(email);
      const socketIds = (await this.cache.get<string[]>(key)) || [];
      const idx = socketIds.indexOf(client.id);
      if (idx != -1) {
        socketIds.splice(idx, 1);
        if (socketIds.length == 0) {
          await this.cache.del(key);
          await this.removeActiveEmail(email);
        } else await this.cache.set(key, socketIds);
        break;
      }
    }
  }

  public async onEmailValidated(email: string): Promise<void> {
    const socketIds =
      (await this.cache.get<string[]>(this.userKey(email))) || [];
    if (!socketIds.length) return;
    for (const socketId of socketIds)
      this.server.to(socketId).emit("email-validated");
    await this.cache.del(this.userKey(email));
    await this.removeActiveEmail(email);
  }

  private usersSetKey(): string {
    return "user:active-emails";
  }

  private userKey(email: string): string {
    return `user:sockets:${email}`;
  }

  private async getActiveEmails(): Promise<string[]> {
    return (await this.cache.get<string[]>(this.usersSetKey())) || [];
  }

  private async addActiveEmail(email: string): Promise<void> {
    const emails = await this.getActiveEmails();
    if (!emails.includes(email)) {
      emails.push(email);
      await this.cache.set(this.usersSetKey(), emails);
    }
  }

  private async removeActiveEmail(email: string): Promise<void> {
    const emails = await this.getActiveEmails();
    const idx = emails.indexOf(email);
    if (idx != -1) {
      emails.splice(idx, 1);
      await this.cache.set(this.usersSetKey(), emails);
    }
  }
}

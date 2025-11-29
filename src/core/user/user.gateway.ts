import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from './entities/user.entity';
import type { Cache } from 'cache-manager';

@WebSocketGateway()
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private readonly usersSetKey = 'user:active-emails';

  public constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  public async handleConnection(client: Socket): Promise<void> {
    const email = String(client.handshake.query.email || '').trim();
    if (!email) return;
    const socketIds = await this.cache.get<string[]>(this.userKey(email));
    await this.addActiveEmail(email);
    await this.cache.set(
      this.userKey(email),
      socketIds ? [...socketIds, client.id] : [client.id],
    );
  }

  public async handleDisconnect(client: Socket): Promise<void> {
    const emails = await this.getActiveEmails();
    for (const email of emails) {
      const key = this.userKey(email);
      const socketIds = await this.cache.get<string[]>(key);
      if (!socketIds) continue;
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

  public async onAccountValidated(user: User): Promise<void> {
    const socketIds = await this.cache.get<string[]>(this.userKey(user.email));
    console.log(socketIds);

    if (!socketIds) return;
    for (const socketId of socketIds)
      this.server.to(socketId).emit('email-validated', user);
    await this.cache.del(this.userKey(user.email));
    await this.removeActiveEmail(user.email);
  }

  private userKey(email: string): string {
    return `user:sockets:${email}`;
  }

  private async getActiveEmails(): Promise<string[]> {
    return (await this.cache.get<string[]>(this.usersSetKey)) || [];
  }

  private async addActiveEmail(email: string): Promise<void> {
    const emails = await this.getActiveEmails();
    if (!emails.includes(email)) {
      emails.push(email);
      await this.cache.set(this.usersSetKey, emails);
    }
  }

  private async removeActiveEmail(email: string): Promise<void> {
    const emails = await this.getActiveEmails();
    const idx = emails.indexOf(email);
    if (idx != -1) {
      emails.splice(idx, 1);
      await this.cache.set(this.usersSetKey, emails);
    }
  }
}

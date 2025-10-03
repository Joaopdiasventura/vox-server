import { Inject } from "@nestjs/common";
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { Server, Socket } from "socket.io";
import { Vote } from "./entities/vote.entity";

@WebSocketGateway()
export class VoteGateway {
  @WebSocketServer()
  private server: Server;

  public constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private sidKey(id: string): string {
    return `vote:sid:${id}`;
  }

  private ridKey(id: string): string {
    return `vote:rid:${id}`;
  }

  private async setPair(
    simpleId: string,
    realId: string,
    ttlMs?: number,
  ): Promise<void> {
    await this.cache.set(this.sidKey(simpleId), realId, ttlMs);
    await this.cache.set(this.ridKey(realId), simpleId, ttlMs);
  }

  private async getRealId(simpleId: string): Promise<string | null> {
    return (await this.cache.get<string>(this.sidKey(simpleId))) || null;
  }

  private async getSimpleId(realId: string): Promise<string | null> {
    return (await this.cache.get<string>(this.ridKey(realId))) || null;
  }

  private async hasSimpleId(simpleId: string): Promise<boolean> {
    return (await this.getRealId(simpleId)) != null;
  }

  private async deleteByRealId(realId: string): Promise<void> {
    const simpleId = await this.getSimpleId(realId);
    await this.cache.del(this.ridKey(realId));
    if (simpleId) await this.cache.del(this.sidKey(simpleId));
  }

  private generateSimpleId(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 5; i++)
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    return result;
  }

  private async generateUniqueSimpleId(): Promise<string> {
    let simpleId = this.generateSimpleId();
    while (await this.hasSimpleId(simpleId)) simpleId = this.generateSimpleId();
    return simpleId;
  }

  public async handleConnection(client: Socket): Promise<void> {
    const realId = client.id;
    const simpleId = await this.generateUniqueSimpleId();
    await this.setPair(simpleId, realId);
    client.emit("new-id", simpleId);
  }

  @SubscribeMessage("allow-vote")
  public async allowVote(client: Socket, urnId: string): Promise<void> {
    const id = await this.getRealId(urnId);
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

  public async handleDisconnect(client: Socket): Promise<void> {
    const realId = client.id;
    await this.deleteByRealId(realId);
  }
}

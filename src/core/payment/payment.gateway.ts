import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import type { Cache } from 'cache-manager';

@WebSocketGateway()
export class PaymentGateway {
  @WebSocketServer()
  private server: Server;

  public constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private ordersSetKey(): string {
    return 'payment:active-orders';
  }

  private orderKey(order: string): string {
    return `payment:sockets:${order}`;
  }

  private async getActiveOrders(): Promise<string[]> {
    return (await this.cache.get<string[]>(this.ordersSetKey())) || [];
  }

  private async addActiveOrder(order: string): Promise<void> {
    const orders = await this.getActiveOrders();
    if (!orders.includes(order)) {
      orders.push(order);
      await this.cache.set(this.ordersSetKey(), orders);
    }
  }

  private async removeActiveOrder(order: string): Promise<void> {
    const orders = await this.getActiveOrders();
    const idx = orders.indexOf(order);
    if (idx != -1) {
      orders.splice(idx, 1);
      await this.cache.set(this.ordersSetKey(), orders);
    }
  }

  public async handleConnection(client: Socket): Promise<void> {
    const userOrder = String(client.handshake.query.order || '').trim();
    if (!userOrder) return;

    const socketIds =
      (await this.cache.get<string[]>(this.orderKey(userOrder))) || [];
    socketIds.push(client.id);
    await this.cache.set(this.orderKey(userOrder), socketIds);
    await this.addActiveOrder(userOrder);
  }

  public async handleDisconnect(client: Socket): Promise<void> {
    const orders = await this.getActiveOrders();
    for (const order of orders) {
      const key = this.orderKey(order);
      const socketIds = (await this.cache.get<string[]>(key)) || [];
      const idx = socketIds.indexOf(client.id);
      if (idx != -1) {
        socketIds.splice(idx, 1);
        if (socketIds.length == 0) {
          await this.cache.del(key);
          await this.removeActiveOrder(order);
        } else await this.cache.set(key, socketIds);

        break;
      }
    }
  }

  public async orderPaid(order: string): Promise<void> {
    const socketIds =
      (await this.cache.get<string[]>(this.orderKey(order))) || [];
    if (!socketIds.length) return;

    for (const socketId of socketIds)
      this.server.to(socketId).emit('order-paid');

    await this.cache.del(this.orderKey(order));
    await this.removeActiveOrder(order);
  }
}

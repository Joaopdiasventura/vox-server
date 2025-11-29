import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, UnauthorizedException } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateBallotBoxDto } from './dto/create-ballot-box.dto';
import { UpdateBallotBoxDto } from './dto/update-ballot-box.dto';
import { BallotBox } from './entities/ballot-box.entity';
import type { Cache } from 'cache-manager';
import { UserService } from '../user/user.service';
import { Message } from '../../shared/interfaces/messages';

@WebSocketGateway()
export class BallotBoxGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  public constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly userService: UserService,
  ) {}

  @SubscribeMessage('createBallotBox')
  public async create(
    @MessageBody() createBallotBoxDto: CreateBallotBoxDto,
    @ConnectedSocket() client: Socket,
  ): Promise<Message> {
    try {
      const user = await this.userService.findById(createBallotBoxDto.user);
      const count = await this.cache.get<number>(this.usersCount(user.id));

      if (
        count &&
        ((count >= 1 && user.plan == 'basic') ||
          (count >= 3 && user.plan == 'pro'))
      )
        throw new UnauthorizedException('Limite de urnas atingido');

      const ballotBoxes =
        (await this.cache.get<Map<string, BallotBox>>(
          this.ballotBoxesKey(createBallotBoxDto.session),
        )) ?? new Map<string, BallotBox>();

      const ballotBox = new BallotBox(createBallotBoxDto);

      ballotBoxes.set(ballotBox.id, ballotBox);

      await this.cache.set(
        this.ballotBoxesKey(createBallotBoxDto.session),
        ballotBoxes,
      );

      await this.cache.set(this.socketIndexKey(client.id), {
        session: createBallotBoxDto.session,
        id: ballotBox.id,
      });

      this.server.emit(
        `ballot-box-created-${createBallotBoxDto.session}`,
        ballotBox,
      );

      return { message: '' };
    } catch (error) {
      return { message: error.message };
    }
  }

  @SubscribeMessage('findAllBallotBox')
  public async findAll(@MessageBody() session: string): Promise<BallotBox[]> {
    const ballotBoxes =
      (await this.cache.get<Map<string, BallotBox>>(
        this.ballotBoxesKey(session),
      )) ?? new Map<string, BallotBox>();
    return Array.from(ballotBoxes.values());
  }

  @SubscribeMessage('updateBallotBox')
  public async update(
    @MessageBody() updateBallotBoxDto: UpdateBallotBoxDto,
  ): Promise<void> {
    const ballotBoxes =
      (await this.cache.get<Map<string, BallotBox>>(
        this.ballotBoxesKey(updateBallotBoxDto.session),
      )) ?? new Map<string, BallotBox>();

    const ballotBox = ballotBoxes.get(updateBallotBoxDto.id);

    if (!ballotBox) return;

    if (typeof updateBallotBoxDto.isBlocked == 'boolean')
      ballotBox.isBlocked = updateBallotBoxDto.isBlocked;
    if (updateBallotBoxDto.name) ballotBox.name = updateBallotBoxDto.name;

    ballotBoxes.set(ballotBox.id, ballotBox);

    await this.cache.set(
      this.ballotBoxesKey(updateBallotBoxDto.session),
      ballotBoxes,
    );

    this.server.emit(`ballot-box-updated-${updateBallotBoxDto.id}`, ballotBox);
  }

  public handleDisconnect(client: Socket): Promise<void> {
    return this.removeBySocketId(client.id);
  }

  private async removeBySocketId(socketId: string): Promise<void> {
    const index = (await this.cache.get<{ session: string; id: string }>(
      this.socketIndexKey(socketId),
    )) as { session: string; id: string } | undefined;

    if (!index) return;

    const { session, id } = index;

    const ballotBoxes =
      (await this.cache.get<Map<string, BallotBox>>(
        this.ballotBoxesKey(session),
      )) ?? new Map<string, BallotBox>();

    if (!ballotBoxes.has(id)) return;

    const removed = ballotBoxes.get(id)!;
    ballotBoxes.delete(id);

    await this.cache.set(this.ballotBoxesKey(session), ballotBoxes);

    await this.cache.del(this.socketIndexKey(socketId));

    this.server.emit(`ballot-box-removed-${session}`, removed);
  }

  private usersCount(user: string): string {
    return `ballot-box:count:${user}`;
  }

  private ballotBoxesKey(session: string): string {
    return `ballot-box:sockets:${session}`;
  }

  private socketIndexKey(socketId: string): string {
    return `ballot-box:socket:${socketId}`;
  }
}

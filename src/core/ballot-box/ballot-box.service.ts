import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BallotBox } from './entities/ballot-box.entity';
import { CreateBallotBoxDto } from './dto/create-ballot-box.dto';
import { UpdateBallotBoxDto } from './dto/update-ballot-box.dto';
import type { Cache } from 'cache-manager';
import { UserService } from '../user/user.service';
import { Message } from '../../shared/interfaces/messages';

@Injectable()
export class BallotBoxService {
  @WebSocketServer()
  private server: Server;

  public constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly userService: UserService,
  ) {}

  public async create(
    createBallotBoxDto: CreateBallotBoxDto,
    socketId: string,
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

      await this.cache.set(this.socketIndexKey(socketId), {
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

  public async findAll(session: string): Promise<BallotBox[]> {
    const ballotBoxes =
      (await this.cache.get<Map<string, BallotBox>>(
        this.ballotBoxesKey(session),
      )) ?? new Map<string, BallotBox>();
    return Array.from(ballotBoxes.values());
  }

  public async update(updateBallotBoxDto: UpdateBallotBoxDto): Promise<void> {
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

  public async removeBySocketId(socketId: string): Promise<void> {
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

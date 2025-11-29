import {
  UseGuards,
  Controller,
  Post,
  Body,
  Get,
  Req,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CreateSessionDto } from './dto/create-session.dto';
import { FindSessionDto } from './dto/find-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionService } from './session.service';
import { Session } from './entities/session.entity';
import { Message } from '../../shared/interfaces/messages';
import { AuthGuard } from '../../shared/modules/auth/guards/auth/auth.guard';
import type { AuthRequest } from '../../shared/interfaces/auth-request';

@UseGuards(AuthGuard)
@Controller('session')
export class SessionController {
  public constructor(private readonly sessionService: SessionService) {}

  @Post()
  public create(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: AuthRequest,
  ): Promise<Message> {
    return this.sessionService.create(createSessionDto, req.user);
  }

  @Get()
  public findMany(
    @Req() req: AuthRequest,
    @Query() findSessionDto: FindSessionDto,
  ): Promise<Session[]> {
    return this.sessionService.findMany(req.user, findSessionDto);
  }

  @Get(':id')
  public findById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Session> {
    return this.sessionService.findById(id);
  }

  @Patch(':id')
  public update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<Message> {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Delete(':id')
  public delete(@Param('id', ParseObjectIdPipe) id: string): Promise<Message> {
    return this.sessionService.delete(id);
  }
}

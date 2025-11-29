import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export class WebSocketAdapter extends IoAdapter {
  public constructor(
    app: INestApplicationContext,
    private readonly cors: CorsOptions,
  ) {
    super(app);
  }

  public override createIOServer(
    port: number,
    options?: ServerOptions,
  ): unknown {
    return super.createIOServer(port, {
      ...options,
      cors: this.cors,
    });
  }
}

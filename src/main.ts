import fastifyStatic from '@fastify/static';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { WebSocketAdapter } from './shared/adapters/web-socket.adapter';

async function bootstrap(): Promise<void> {
  const adapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const corsOptions = {
    origin: '*',
    methods: ['GET', 'DELETE', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.enableCors(corsOptions);
  app.useWebSocketAdapter(new WebSocketAdapter(app, corsOptions));

  await adapter.register(fastifyStatic, {
    root: join(__dirname, '..', '/.well-known/'),
    prefix: '/.well-known/',
  });

  await app.listen({
    port: configService.get<number>('port'),
    host: '0.0.0.0',
  });
}

bootstrap();

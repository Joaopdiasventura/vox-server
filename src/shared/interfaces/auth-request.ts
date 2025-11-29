import { FastifyRequest } from 'fastify';

export interface AuthRequest extends FastifyRequest {
  user: string;
}

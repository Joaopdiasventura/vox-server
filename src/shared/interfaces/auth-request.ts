import { User } from "../../core/user/entities/user.entity";
import type { Request } from "express";

export interface AuthRequest extends Request {
  user: User;
}

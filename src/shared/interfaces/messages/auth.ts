import { User } from "../../../core/user/entities/user.entity";
import { Message } from ".";

export interface AuthMessage extends Message {
  token: string;
  user: User;
}

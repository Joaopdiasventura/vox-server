import { Message } from '.';
import { User } from '../../../core/user/entities/user.entity';

export interface AuthMessage extends Message {
  token: string;
  user: User;
}

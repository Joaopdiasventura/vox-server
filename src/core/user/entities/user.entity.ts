import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { Plan } from '../../../shared/types/plan';

@Schema({ versionKey: false })
export class User extends Document<string, User, User> {
  @Prop({ required: true, unique: true })
  public email: string;

  @Prop({ required: false, unique: true, sparse: true })
  public taxId?: string;

  @Prop({ required: true })
  public name: string;

  @Prop({ required: false })
  public cellphone?: string;

  @Prop({ required: true })
  public password?: string;

  @Prop({ default: 'basic' })
  public plan: Plan;

  @Prop({ default: 0 })
  public votes: number;

  @Prop({ default: false })
  public isValid: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

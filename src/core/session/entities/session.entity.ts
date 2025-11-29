import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Election } from '../../election/entities/election.entity';

@Schema({ versionKey: false, timestamps: true })
export class Session extends Document<string, Session, Session> {
  @Prop({ required: true, index: true, type: [String], ref: 'Election' })
  public elections: Election[];

  @Prop({ default: 0 })
  public votes: number;

  @Prop({ required: true })
  public startedAt: Date;

  @Prop({ required: true })
  public endedAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

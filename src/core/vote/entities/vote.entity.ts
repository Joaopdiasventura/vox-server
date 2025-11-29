import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Session } from '../../session/entities/session.entity';
import { Candidate } from '../../candidate/entities/candidate.entity';
import { Election } from '../../election/entities/election.entity';

@Schema({ versionKey: false, timestamps: true })
export class Vote extends Document<string, Vote, Vote> {
  @Prop({ required: true, index: true, type: String, ref: 'Election' })
  public election: Election;

  @Prop({ required: true, index: true, type: String, ref: 'Session' })
  public session: Session;

  @Prop({ required: false, index: true, type: String, ref: 'Candidate' })
  public candidate?: Candidate;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

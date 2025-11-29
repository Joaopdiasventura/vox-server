import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Election } from '../../election/entities/election.entity';

@Schema({ versionKey: false, timestamps: false })
export class Candidate extends Document<string, Candidate, Candidate> {
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true, index: true, type: String, ref: 'Election' })
  public election: Election;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);

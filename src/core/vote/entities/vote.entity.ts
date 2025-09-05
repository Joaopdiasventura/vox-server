import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Pool } from "../../pool/entities/pool.entity";
import { Candidate } from "../../candidate/entities/candidate.entity";

@Schema({ versionKey: false, timestamps: true })
export class Vote extends Document<string, Vote, Vote> {
  @Prop({ required: true, index: true, type: String, ref: "Pool" })
  public pool: Pool;

  @Prop({ required: false, type: String, ref: "Candidate" })
  public candidate?: Candidate;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

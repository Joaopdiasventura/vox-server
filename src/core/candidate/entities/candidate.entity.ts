import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Group } from "../../group/entities/group.entity";

@Schema({ versionKey: false })
export class Candidate extends Document<string, Candidate, Candidate> {
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true, type: String, ref: "Group" })
  public group: Group;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);

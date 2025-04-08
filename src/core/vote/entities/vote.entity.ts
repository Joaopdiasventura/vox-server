import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Participant } from "../../participant/entities/participant.entity";

@Schema({ versionKey: false, timestamps: true })
export class Vote extends Document<string, Vote, Vote> {
  @Prop({ required: true, type: String, ref: "Participant" })
  public participant: string | Participant;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

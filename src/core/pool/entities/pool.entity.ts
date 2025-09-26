import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Group } from "../../group/entities/group.entity";

@Schema({ versionKey: false, timestamps: true })
export class Pool extends Document<string, Pool, Pool> {
  @Prop({ required: true, index: true, type: String, ref: "Group" })
  public group: Group;

  @Prop({ required: true, default: 0 })
  public votes: number;

  @Prop({ required: true })
  public start: Date;

  @Prop({ required: true })
  public end: Date;
}

export const PoolSchema = SchemaFactory.createForClass(Pool);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { User } from "../../user/entities/user.entity";

@Schema({ versionKey: false })
export class Group extends Document<string, Group, Group> {
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true, index: true, type: String, ref: "User" })
  public user: User;

  @Prop({ required: false, type: String, ref: "Group" })
  public group?: Group;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

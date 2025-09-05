import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ versionKey: false })
export class User extends Document<string, User, User> {
  @Prop({ required: true, unique: true })
  public email: string;

  @Prop({ required: true })
  public name: string;

  @Prop({ required: true })
  public password?: string;

  @Prop({ default: false })
  public isValid: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

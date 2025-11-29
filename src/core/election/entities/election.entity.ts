import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Election extends Document<string, Election, Election> {
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true, index: true, type: String, ref: 'User' })
  public user: string;
}

export const ElectionSchema = SchemaFactory.createForClass(Election);

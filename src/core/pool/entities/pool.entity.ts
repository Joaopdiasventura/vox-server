import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ versionKey: false, timestamps: true })
export class Pool {
  @Prop({ required: true, index: true, type: String, ref: "Group" })
  public group: string;

  @Prop({ required: true })
  public start: Date;

  @Prop({ required: true })
  public end: Date;
}

export const PoolSchema = SchemaFactory.createForClass(Pool);

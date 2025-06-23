import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MemberDocument = Member & Document;

@Schema({ timestamps: true, collection: 'members' })
export class Member {
  @Prop({ required: true, unique: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  password?: string;

  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: true, unique: true, type: String })
  nickname: string;

  @Prop({ required: true, type: [String] })
  interests: string[];
}

export const MemberSchema = SchemaFactory.createForClass(Member);
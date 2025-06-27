import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  @Prop({
    type: [
      {
        requestId: String,
        title: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  requests: {
    requestId: string;
    _id?: any;
    title: string;
    content: string;
    createdAt: Date;
  }[];

    _id?: Types.ObjectId;

}

export const MemberSchema = SchemaFactory.createForClass(Member);
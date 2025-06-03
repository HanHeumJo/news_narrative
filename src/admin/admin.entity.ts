// src/admin/admin.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema()
export class Admin {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string; // bcrypt 해시로 저장
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

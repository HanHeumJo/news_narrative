import { Schema } from 'mongoose';

export const CommentSchema = new Schema({
  newsId: { type: String, required: true },
  nickname: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
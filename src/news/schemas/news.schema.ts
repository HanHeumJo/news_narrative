// 뉴스 게시물 스키마 정의 (Mongoose + NestJS)
// ===============================================
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// 댓글(Comment) 서브도큐먼트 인터페이스 정의
class Comment {
  /** 댓글 고유 ID */
  commentId: string;
  /** 댓글 작성자 이메일 또는 식별자 */
  author: string;
  /** 댓글 내용 */
  content: string;
  /** 댓글 작성일 */
  createdAt: Date;
}

// 요청(Request) 서브도큐먼트 인터페이스 정의: 일반 요청 또는 수정 요청
class Request {
  /** 요청 고유 ID */
  requestId: string;
  /** 요청 타입 (0 = 일반, 1 = 수정) */
  type: number;
  /** 요청 내용 */
  content: string;
  /** 요청을 보낸 사용자 식별자 */
  requestedBy: string;
  /** 요청 생성일 */
  createdAt: Date;
}

@Schema()
export class News extends Document {
  @Prop({ required: true })
  /** 게시물 제목 */
  title: string;

  @Prop()
  /** 게시물 본문 내용 */
  content: string;

  @Prop([String])
  /** 게시물 태그(카테고리) 목록 */
  tags: string[];

  @Prop({ default: Date.now })
  /** 게시물 작성일 */
  date: Date;

  @Prop([Object])
  /** 댓글 배열 */
  comments: Comment[];

  @Prop([Object])
  /** 요청(수정 또는 일반) 배열 */
  requests: Request[];
}

export const NewsSchema = SchemaFactory.createForClass(News);

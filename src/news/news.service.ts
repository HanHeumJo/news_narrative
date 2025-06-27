// src/news/news.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { News } from './schemas/news.schema';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<News>,
  ) {}

  /** 키워드로 게시물 검색 */
  async search(keyword: string) {
    if (!keyword) throw new BadRequestException('검색어를 입력해주세요.');
    const data = await this.newsModel.find({ title: new RegExp(keyword, 'i') }).lean();
    return data.map(item => ({
      ...item,
      id: item._id,  // 항상 id 필드 추가!
    }));
  }

  /** 카테고리(태그)로 게시물 조회 */
  async findByCategory(category: string) {
    const data = await this.newsModel.find({ tags: category }).lean();
    return data.map(item => ({
      ...item,
      id: item._id,
    }));
  }

  /** 이달 조회수 기준 상위 5개 게시물 */
  async findMonthlyTop5() {
    const data = await this.newsModel
      .find()
      .sort({ viewCount: -1 })
      .limit(5)
      .lean();
    return data.map(item => ({
      ...item,
      id: item._id,
    }));
  }

  /** 전체 뉴스 리스트 */
  async newsList() {
    const data = await this.newsModel.find().lean();
    return data.map(item => ({
      ...item,
      id: item._id,
    }));
  }

  /** 단일 게시물 조회 */
  async viewContent(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('유효하지 않은 ID입니다.');
    const post = await this.newsModel.findById(id).lean();
    if (!post) throw new NotFoundException('게시물을 찾을 수 없습니다.');
    return { ...post, id: post._id };
  }

  /**
   * 요청 생성 (일반 또는 수정 요청)
   * @param postId 게시물 ID
   * @param type 요청 타입(0 or 1)
   * @param content 요청 내용
   * @param user 요청자 식별자(이메일 등)
   */
  async createRequest(
    postId: string,
    type: number,
    content: string,
    user: string,
  ) {
    const post = await this.viewContent(postId);
    const request = {
      requestId: Date.now().toString(),
      type,
      content,
      requestedBy: user,
      createdAt: new Date(),
    };
    post.requests = post.requests || [];
    post.requests.push(request as any);
    await post.save();
    return request;
  }
}

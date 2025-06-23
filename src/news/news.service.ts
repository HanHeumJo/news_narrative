// 비즈니스 로직을 처리하는 서비스 계층
// ===============================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News } from './schemas/news.schema';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<News>,
  ) {}

  /**
   * 키워드로 게시물 검색
   * @param keyword 검색어
   * @returns 일치하는 게시물 리스트
   */
  async search(keyword: string) {
    if (!keyword) throw new BadRequestException('검색어를 입력해주세요.');
    // 정규식 i 옵션으로 대소문자 구분 없이 제목 검색
    return this.newsModel.find({ title: new RegExp(keyword, 'i') }).exec();
  }

  /**
   * 특정 카테고리(태그)로 게시물 조회
   * @param category 태그명
   * @returns 해당 태그를 가진 게시물 리스트
   */
  async findByCategory(category: string) {
    return this.newsModel.find({ tags: category }).exec();
  }

  /**
   * 이달 조회수 기준 상위 5개 게시물 조회
   */
  async findMonthlyTop5() {
    // viewCount 필드는 스키마에 추가 필요 (예시 목적)
    return this.newsModel
      .find()
      .sort({ viewCount: -1 }) // 내림차순
      .limit(5)
      .exec();
  }

  /**
   * 전체 게시물 리스트 반환 (뉴스 리스트)
   */
  async newsList() {
    return this.newsModel.find().exec();
  }

  /**
   * 단일 게시물 조회
   * @param id 게시물 ID
   */
  async viewContent(id: string) {
    const post = await this.newsModel.findById(id).exec();
    if (!post) throw new NotFoundException('게시물을 찾을 수 없습니다.');
    return post;
  }

  /**
   * 댓글 생성 및 저장
   * @param postId 댓글 대상 게시물 ID
   * @param author 작성자 식별자
   * @param content 댓글 내용
   */
  async createComment(
    postId: string,
    author: string,
    content: string,
  ) {
    const post = await this.viewContent(postId);
    const comment = {
      commentId: Date.now().toString(),
      author,
      content,
      createdAt: new Date(),
    };
    post.comments = post.comments || [];
    post.comments.push(comment as any);
    await post.save(); // 변경된 문서 저장
    return comment;
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

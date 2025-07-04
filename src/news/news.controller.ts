// HTTP 요청을 처리하고 서비스 호출
// ===============================================
import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NewsService } from './news.service';

@Controller('api')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  root() {
    return { message: 'API Root: Welcome to News API' };
  }
  /**
   * GET /api/search?keyword=키워드
   * 키워드로 게시물 검색
   */
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.newsService.search(keyword);
  }

  /**
   * GET /api/monthnews
   * 이달의 인기 뉴스 top5 반환
   */
  @Get('monthnews')
  monthNews() {
    return this.newsService.findMonthlyTop5();
  }

  /**
   * GET /api/search-by-category
   * 특정 카테고리별 게시물 조회
   */
  @Get('search-by-category')
  searchByCategory(@Query('category') category: string) {
    return this.newsService.findByCategory(category);
  }

  /**
   * GET /api/newslist
   * 전체 뉴스 리스트 조회
   */
  @Get('newslist')
  newsList() {
    return this.newsService.newsList();
  }

  /**
   * GET /api/content?id=게시물ID
   * 단일 게시물 조회
   */
  @Get('content')
  viewContent(@Query('id') id: string) {
    if (!id) throw new BadRequestException('id가 필요합니다.');
    return this.newsService.viewContent(id);
  }

  /**
   * POST /api/user/content/:id?requestType=0 or 1
   * 게시물 요청 작성 (일반/수정 요청) (인증 필요)
   */
  @Post('user/content/:id')
  @UseGuards(AuthGuard('jwt'))
  postRequest(
    @Param('id') postId: string,
    @Query('requestType') requestType: string,
    @Body('content') content: string,
    @Req() req,
  ) {
    const type = Number(requestType);
    if (![0, 1].includes(type))
      throw new BadRequestException('requestType은 0 또는 1이어야 합니다.');
    return this.newsService.createRequest(
      postId,
      type,
      content,
      req.user.email,
    );
  }

  @Post('manual')
  async manualSave(
    @Body() body: { title: string; content: string; tag: string },
  ) {
    if (!body.title || !body.content || !body.tag) {
      throw new BadRequestException('제목, 내용, 카테고리는 필수입니다.');
    }
    return this.newsService.acceptRequestAsNews(
      body.title,
      body.content,
      body.tag,
    );
  }
}

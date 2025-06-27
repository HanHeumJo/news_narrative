import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async getComments(@Query('newsId') newsId: string) {
    return this.commentService.findByNewsId(newsId);
  }

  @Post()
  async createComment(@Body() dto: CreateCommentDto) {
    return this.commentService.create(dto);
  }
}

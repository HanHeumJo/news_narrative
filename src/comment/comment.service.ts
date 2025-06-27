import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<any>
  ) {}

  async create(dto: CreateCommentDto) {
    return new this.commentModel(dto).save();
  }

  async findByNewsId(newsId: string) {
    return this.commentModel.find({ newsId }).sort({ createdAt: -1 }).exec();
  }
}

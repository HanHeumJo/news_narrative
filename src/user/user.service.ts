// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async addRequest(id: string, request: { title: string; content: string }) {
    return this.userModel.findByIdAndUpdate(
      id,
      { $push: { requests: request } },
      { new: true },
    );
  }
  

  async deleteRequest(id: string, requestId: string) {
    return this.userModel.findByIdAndUpdate(
      id,
      { $pull: { requests: { _id: requestId } } },
      { new: true },
    );
  }
}

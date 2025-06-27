import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('User Requests')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id/requests')
  @ApiOperation({ summary: '사용자 요청 전체 조회' })
  async getRequests(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user.requests;
  }

  @Post(':id/requests')
  @ApiOperation({ summary: '요청 추가' })
  async addRequest(
    @Param('id') id: string,
    @Body() body: { title: string; content: string },
  ) {
    return this.userService.addRequest(id, body);
  }

  @Delete(':id/requests/:requestId')
  @ApiOperation({ summary: '요청 삭제' })
  async deleteRequest(@Param('id') id: string, @Param('requestId') requestId: string) {
    return this.userService.deleteRequest(id, requestId);
  }
}

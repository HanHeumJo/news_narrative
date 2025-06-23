import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('User Requests')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: '전체 사용자 목록 조회 (관리자용)' })
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/requests')
  @ApiOperation({ summary: '사용자 요청 전체 조회' })
  async getRequests(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user.requests;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: '사용자 단일 조회 (상세 정보용)' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/requests')
  @ApiOperation({ summary: '요청 추가' })
  async addRequest(
    @Param('id') id: string,
    @Body() body: { title: string; content: string },
  ) {
    return this.userService.addRequest(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/requests/:requestId')
  @ApiOperation({ summary: '요청 삭제' })
  async deleteRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
  ) {
    return this.userService.deleteRequest(id, requestId);
  }
}

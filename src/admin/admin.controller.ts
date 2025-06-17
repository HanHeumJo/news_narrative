import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('admin')
@ApiTags('Admin')
export class AdminController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: '내 관리자 정보 조회' })
  @ApiBearerAuth()
  getMe(@Req() req) {
    return {
      message: '인증된 관리자입니다.',
      admin: req.user,
    };
  }
}

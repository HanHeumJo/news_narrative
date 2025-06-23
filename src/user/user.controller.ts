// 사용자 프로필 조회 엔드포인트
// ===============================================
import {
  Controller,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /api/user
   * 로그인된 사용자 프로필 조회
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  profile(@Req() req) {
    if (!req.user) throw new UnauthorizedException('로그인이 필요합니다.');
    return this.userService.getProfile(req.user);
  }
}

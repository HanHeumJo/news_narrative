// 사용자 서비스: JWT 페이로드 기반 프로필 반환
// ===============================================
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  /**
   * @param user JWT 인증 후 Req.user 객체
   * @returns 사용자 프로필 정보
   */
  getProfile(user: any) {
    return {
      email: user.email,
      nickname: user.nickname || user.username,
      joinedAt: new Date(user.iat * 1000), // 토큰 발행 시간 사용
      role: user.role || 'member',
    };
  }
}

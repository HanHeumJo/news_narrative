import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../common/dto/login.dto';
import { SignupDto } from 'src/common/dto/signup.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '관리자 로그인', description: '아이디와 비밀번호로 JWT 토큰 발급' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: '토큰 발급 성공' })
  @ApiResponse({ status: 401, description: '아이디 또는 비밀번호가 틀림' })
  async login(@Body() loginDto: LoginDto) {
    const admin = await this.authService.validateAdmin(
      loginDto.username,
      loginDto.password,
    );
    return this.authService.login(admin);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: '서버는 토큰 상태를 저장하지 않음. 클라이언트가 토큰을 제거해야 함.' })
  @ApiResponse({ status: 200, description: '로그아웃 메시지 반환' })
  logout() {
    return { message: 'Token discarded on client. Logout successful.' };
  }

  @Post('signup')
  @ApiOperation({ summary: '관리자 회원가입', description: '아이디/비밀번호로 관리자 계정 생성' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: '관리자 생성 성공' })
  @ApiResponse({ status: 400, description: '중복된 아이디' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }
}

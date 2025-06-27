import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberLocalAuthGuard } from './guards/member-local-auth.guard';
import { MemberJwtAuthGuard } from './guards/member-jwt.auth.guard';

@Controller('api/members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('check-nickname')
  async checkNickname(@Query('nickname') nickname: string) {
    const member = await this.memberService.findOneByNickname(nickname);
    
    return { isAvailable: !member };
  }

  @Post('signup')
  async signUp(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.signUp(createMemberDto);
  }

  @UseGuards(MemberLocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    return this.memberService.login(req.user);
  }

  @Post('find-id')
  @HttpCode(HttpStatus.OK)
  async findId(@Body('email') email: string) {
    return this.memberService.findIdByEmail(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body('email') email: string) {
      return this.memberService.resetPassword(email);
  }

  @UseGuards(MemberJwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
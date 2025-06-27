import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MemberService } from '../member.service';

@Injectable()
export class MemberLocalStrategy extends PassportStrategy(Strategy, 'member-local') { // 고유 이름 지정
  constructor(private memberService: MemberService) {
    super({ usernameField: 'id' });
  }

  async validate(id: string, password: string): Promise<any> {
    const member = await this.memberService.validateMember(id, password);
    if (!member) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
    return member;
  }
}
// src/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/common/dto/login.dto';
import { SignupDto } from 'src/common/dto/signup.dto';
@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.adminService.findByUsername(dto.username);
    if (existing) {
      throw new BadRequestException('이미 존재하는 관리자입니다.');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const admin = await this.adminService.create(
      dto.username,
      hashed,
      dto.name,
    );
    return {
      message: '관리자 등록 완료',
      admin: { username: admin.username, name: admin.name },
    };
  }

  async validateAdmin(username: string, password: string) {
    const admin = await this.adminService.findByUsername(username);

    if (!admin) {
      throw new UnauthorizedException('등록된 관리자가 없습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 틀립니다.');
    }

    return admin;
  }

  async login(admin: any) {
    const payload = {
      sub: admin._id,
      username: admin.username,
      name: admin.name,
      role:'admin',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

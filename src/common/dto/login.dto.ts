// src/common/dto/login.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: '관리자 아이디' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin1234', description: '비밀번호' })
  @IsString()
  password: string;
}
import { IsString, MinLength } from 'class-validator';

export class LoginMemberDto {
  @IsString()
  id: string;

  @IsString()
  @MinLength(8)
  password: string;
}
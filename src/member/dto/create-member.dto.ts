import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
  IsIn,
} from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  id: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(12)
  nickname: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(['정치', '시사', '경제', '스포츠', '사회'], { each: true })
  interests: string[];
}

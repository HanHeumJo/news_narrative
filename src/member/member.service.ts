import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member, MemberDocument } from './schemas/member.schema';
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    private jwtService: JwtService,
  ) {}

  async validateMember(id: string, pass: string): Promise<any> {
    const member = await this.memberModel.findOne({ id }).exec();
    if (member && (await bcrypt.compare(pass, member.password))) {
      const { password, ...result } = member.toObject();
      return result;
    }
    return null;
  }

  async signUp(createMemberDto: CreateMemberDto) {
    if (await this.memberModel.findOne({ id: createMemberDto.id }).exec()) {
      throw new ConflictException('이미 사용중인 아이디입니다.');
    }
    if (
      await this.memberModel.findOne({ email: createMemberDto.email }).exec()
    ) {
      throw new ConflictException('이미 사용중인 이메일입니다.');
    }
    if (
      await this.memberModel
        .findOne({ nickname: createMemberDto.nickname })
        .exec()
    ) {
      throw new ConflictException('이미 사용중인 닉네임입니다.');
    }

    const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);
    const newMember = new this.memberModel({
      ...createMemberDto,
      password: hashedPassword,
    });
    await newMember.save();
    return {
      message: '회원가입이 성공적으로 완료되었습니다.',
      memberId: newMember.id,
    };
  }

  async login(member: Member) {
    const payload = {
      _id: (member as any)._id.toString(),
      id: member.id,
      sub: (member as any)._id.toString(),
      nickname: member.nickname,
      role: 'user',
    };
    return {
      message: '로그인에 성공했습니다.',
      access_token: this.jwtService.sign(payload),
    };
  }

  async findOneByNickname(nickname: string): Promise<Member | null> {
    return this.memberModel.findOne({ nickname }).exec();
  }

  async findIdByEmail(email: string): Promise<{ id: string }> {
    const member = await this.memberModel.findOne({ email }).exec();
    if (!member) {
      throw new NotFoundException(
        '해당 이메일로 가입된 계정을 찾을 수 없습니다.',
      );
    }
    return { id: member.id };
  }

  async resetPassword(email: string): Promise<{ message: string }> {
    const member = await this.memberModel.findOne({ email }).exec();
    if (!member) {
      throw new NotFoundException(
        '해당 이메일로 가입된 계정을 찾을 수 없습니다.',
      );
    }
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    await this.memberModel.updateOne(
      { _id: member._id },
      { password: hashedTempPassword },
    );

    console.log(
      `[멤버 임시 비밀번호 발급] Email: ${email}, Temp Password: ${tempPassword}`,
    );

    return { message: '가입하신 이메일로 임시 비밀번호가 발송되었습니다.' };
  }

  async findAll(): Promise<Member[]> {
    return this.memberModel.find().exec();
  }

  async findById(id: string): Promise<Member | null> {
    return this.memberModel.findById(id).exec();
  }

  async getRequests(memberId: string) {
    const member = await this.memberModel.findById(memberId).exec(); // ← 핵심 수정
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member.requests;
  }

  async addRequest(memberId: string, createRequestDto: CreateRequestDto) {
    const member = await this.memberModel.findById(memberId).exec(); // ← 여기도 동일하게 수정
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    member.requests.push({
      ...createRequestDto,
      requestId: Date.now().toString(),
      createdAt: new Date(),
    });

    await member.save();
    return member.requests;
  }

  async deleteRequest(memberId: string, requestId: string) {
    const member = await this.memberModel.findById(memberId).exec();
    if (!member) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const originalLength = member.requests.length;
    member.requests = member.requests.filter(
      (req) => req._id.toString() !== requestId,
    );

    if (member.requests.length === originalLength) {
      throw new NotFoundException('요청을 찾을 수 없습니다.');
    }

    await member.save();
    return { message: '요청이 삭제되었습니다.' };
  }
}

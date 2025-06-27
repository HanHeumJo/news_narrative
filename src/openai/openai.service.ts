// src/openai/openai.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // .env에 반드시 설정
    });
  }

  async generateNarrative(title: string, content: string): Promise<string> {
    const prompt = `다음 제목과 내용을 바탕으로 나무위키 스타일로 서사를 정리해줘.\n\n제목: ${title}\n\n내용: ${content}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0]?.message?.content?.trim() || '요약 실패';
  }
}

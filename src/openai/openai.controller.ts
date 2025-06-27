import { Controller, Post, Body } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('narrative')
  async summarize(@Body() body: { title: string; content: string }) {
    const narrative = await this.openaiService.generateNarrative(
      body.title,
      body.content,
    );
    return { narrative };
  }
}

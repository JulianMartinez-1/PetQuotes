import { Body, Controller, Get, Post } from '@nestjs/common';
import { OllamaService } from './ollama.service';

@Controller('ai')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('generate')
  async generate(@Body() body: { prompt: string }) {
    const text = await this.ollamaService.generateText(body.prompt);
    return { response: text };
  }

  @Post('chat')
  async chat(@Body() body: { messages: Array<{ role: string; content: string }> }) {
    const response = await this.ollamaService.chat(body.messages);
    return { message: response };
  }

  @Get('models')
  async getModels() {
    const models = await this.ollamaService.getModels();
    return { models };
  }
}

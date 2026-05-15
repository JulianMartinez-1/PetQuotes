import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OllamaService {
  private readonly ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private readonly model = process.env.OLLAMA_MODEL || 'llama2';

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
      });

      return response.data.response;
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw new Error('Error generating text with Ollama');
    }
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const response = await axios.post(`${this.ollamaBaseUrl}/api/chat`, {
        model: this.model,
        messages: messages,
        stream: false,
      });

      return response.data.message.content;
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw new Error('Error with Ollama chat');
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.ollamaBaseUrl}/api/tags`);
      return response.data.models.map((m: any) => m.name);
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }
}

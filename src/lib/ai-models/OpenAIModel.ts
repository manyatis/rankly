import OpenAI from 'openai';
import { BaseAIModel } from './BaseAIModel';

export class OpenAIModel extends BaseAIModel {
  private client: OpenAI | null = null;

  getName(): string {
    return 'OpenAI';
  }

  getRequiredEnvVars(): string[] {
    return ['OPENAI_API_KEY'];
  }

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable not set');
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  async query(prompt: string): Promise<string> {
    try {
      this.logQuery(prompt);

      if (!this.isConfigured()) {
        console.log(`❌ [${this.getName()}] API key not found`);
        return this.getMissingEnvVarError();
      }

      const client = this.getClient();
      const response = await client.responses.create({
        model: 'gpt-4.1-mini',
        max_output_tokens: 500,
        tools: [{ type: 'web_search_preview' }],
        input: prompt
      });

      const result = response.output_text;
      this.logSuccess(result.length);
      return result;
    } catch (error) {
      this.logError(error);
      return this.formatError(error);
    }
  }
}
import Anthropic from '@anthropic-ai/sdk';
import { BaseAIModel } from './BaseAIModel';

export class AnthropicModel extends BaseAIModel {
  private client: Anthropic | null = null;

  getName(): string {
    return 'Anthropic';
  }

  getRequiredEnvVars(): string[] {
    return ['ANTHROPIC_API_KEY'];
  }

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable not set');
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  async query(prompt: string): Promise<string> {
    try {
      this.logQuery(prompt);

      if (!this.isConfigured()) {
        console.debug(`❌ [${this.getName()}] API key not found`);
        return this.getMissingEnvVarError();
      }

      const client = this.getClient();

      const response = await client.messages.create({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 300,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search'
          }
        ],
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const result = response.content
        .filter(content => content.type === 'text')
        .map(content => 'text' in content ? content.text : '')
        .join('\n') || 'No response generated';
      
      this.logSuccess(result.length);
      return result;
    } catch (error) {
      this.logError(error);
      return this.formatError(error);
    }
  }
}
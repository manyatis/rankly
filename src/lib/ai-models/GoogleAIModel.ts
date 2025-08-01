import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIModel } from './BaseAIModel';

export class GoogleAIModel extends BaseAIModel {
  private client: GoogleGenerativeAI | null = null;

  getName(): string {
    return 'Google';
  }

  getRequiredEnvVars(): string[] {
    return ['GOOGLE_AI_API_KEY'];
  }

  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY environment variable not set');
      }
      this.client = new GoogleGenerativeAI(apiKey);
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
      
      // Use Gemini 1.5 Flash - note: grounding requires special API access
      const model = client.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        }
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text() || 'No response generated';
      
      this.logSuccess(text.length);
      return text;
    } catch (error) {
      this.logError(error);
      return this.formatError(error);
    }
  }
}
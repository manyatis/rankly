import { BaseAIModel } from './BaseAIModel';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  return_citations?: boolean;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: 'month' | 'week' | 'day' | 'hour';
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class PerplexityModel extends BaseAIModel {
  private readonly baseUrl = 'https://api.perplexity.ai';

  getName(): string {
    return 'Perplexity';
  }

  getRequiredEnvVars(): string[] {
    return ['PERPLEXITY_API_KEY'];
  }

  private async makeRequest(data: PerplexityRequest): Promise<PerplexityResponse> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable not set');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<PerplexityResponse>;
  }

  async query(prompt: string): Promise<string> {
    try {
      this.logQuery(prompt);

      if (!this.isConfigured()) {
        console.log(`❌ [${this.getName()}] API key not found`);
        return this.getMissingEnvVarError();
      }
      
      const requestData: PerplexityRequest = {
        model: 'sonar', 
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides comprehensive and accurate information about companies and businesses. Focus on providing current, factual information with proper context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.2, // Lower temperature for more consistent, factual responses
        top_p: 0.9,
        return_citations: true, // Enable citations for better accuracy tracking
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month', // Focus on recent information
        presence_penalty: 0,
        frequency_penalty: 0.1,
      };

      const response = await this.makeRequest(requestData);

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response choices received from Perplexity API');
      }

      const result = response.choices[0].message.content;
      
      if (!result) {
        throw new Error('Empty response content from Perplexity API');
      }

      this.logSuccess(result.length);
      console.log(`🔍 [${this.getName()}] Tokens used: ${response.usage.total_tokens} (prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens})`);
      
      return result;
    } catch (error) {
      this.logError(error);
      return this.formatError(error);
    }
  }
}
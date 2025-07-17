import OpenAI from 'openai';
import { PromptTemplateLoader } from '../lib/PromptTemplateLoader';

interface BusinessContext {
  businessName: string;
  industry: string;
  marketDescription: string;
  keywords: string[];
}

interface OptimizedPrompts {
  queries: string[];
}

export class PromptFormationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateOptimizedPrompts(context: BusinessContext, queryCount: number = 2): Promise<OptimizedPrompts> {
    const { industry, marketDescription, keywords } = context;

    try {
      // Load prompts from template files
      const systemPrompt = await PromptTemplateLoader.loadAEOSystemPrompt();
      const userPrompt = await PromptTemplateLoader.loadGenerateQueriesPrompt({
        industry,
        marketDescription,
        keywords: keywords.join(', '),
        queryCount: queryCount.toString()
      });

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const result = JSON.parse(content) as OptimizedPrompts;
      
      // Validate the response structure
      if (!result.queries || !Array.isArray(result.queries) || result.queries.length === 0) {
        throw new Error('Invalid response structure from OpenAI');
      }

      // Ensure we have the requested number of queries
      if (result.queries.length < queryCount) {
        // Fallback to default query generation if too few queries
        result.queries = await this.generateFallbackQueries(context, queryCount);
      }

      return result;
    } catch (templateError) {
      console.error('Error loading prompt templates:', templateError);
      
      // Try fallback queries first, then legacy if that fails too
      try {
        const fallbackQueries = await this.generateFallbackQueries(context, queryCount);
        return { queries: fallbackQueries };
      } catch (fallbackError) {
        console.error('Error loading fallback queries, using legacy:', fallbackError);
        return {
          queries: this.generateFallbackQueriesLegacy(context, queryCount)
        };
      }
    }
  }

  private async generateFallbackQueries(context: BusinessContext, queryCount: number = 2): Promise<string[]> {
    const { industry, keywords } = context;
    const primaryKeyword = keywords[0] || industry;

    try {
      // Load fallback queries from template
      const patterns = await PromptTemplateLoader.loadFallbackQueries();
      
      const allQueries = patterns.map(pattern => 
        pattern
          .replace(/{{industry}}/g, industry.toLowerCase())
          .replace(/{{primaryKeyword}}/g, primaryKeyword)
      );

      return allQueries.slice(0, queryCount);
    } catch (error) {
      console.error('Error loading fallback queries:', error);
      return this.generateFallbackQueriesLegacy(context, queryCount);
    }
  }

  private generateFallbackQueriesLegacy(context: BusinessContext, queryCount: number = 2): string[] {
    const { industry, keywords } = context;
    const primaryKeyword = keywords[0] || industry;

    const allQueries = [
      `What are the best ${industry.toLowerCase()} companies?`,
      `Top ${industry.toLowerCase()} solutions for businesses`,
      `How to choose a ${industry.toLowerCase()} provider`,
      `${primaryKeyword} services comparison`,
      `Best ${primaryKeyword} tools and platforms`,
      `Leading companies in ${industry.toLowerCase()}`,
      `${industry} recommendations for small businesses`,
      `Who are the top ${industry.toLowerCase()} vendors?`,
      `${primaryKeyword} market leaders`,
      `Best ${industry.toLowerCase()} services in 2024`
    ];

    return allQueries.slice(0, queryCount);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI API key validation failed:', error);
      return false;
    }
  }
}
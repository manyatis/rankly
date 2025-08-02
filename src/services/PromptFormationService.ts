import OpenAI from 'openai';
import { PromptTemplateLoader } from '../lib/PromptTemplateLoader';

interface BusinessContext {
  businessName: string;
  industry: string;
  location?: string;
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
    const { businessName, industry, location, marketDescription, keywords } = context;

    try {
      // Reserve one slot for direct business query
      const aiGeneratedCount = Math.max(1, queryCount - 1);
      
      // Load prompts from template files
      const systemPrompt = await PromptTemplateLoader.loadAEOSystemPrompt();
      const userPrompt = await PromptTemplateLoader.loadGenerateQueriesPrompt({
        industry,
        location: location ? `\n- Location: ${location}\n\n` : '',
        marketDescription,
        keywords: keywords.join(', '),
        queryCount: aiGeneratedCount.toString()
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

      // Add the direct business query (this will get 5 point scoring boost)
      const directQuery = this.generateDirectBusinessQuery(context);
      result.queries.push(directQuery);

      // Ensure we have the requested number of queries
      if (result.queries.length < queryCount) {
        // Fallback to default query generation if too few queries
        const fallbackQueries = await this.generateFallbackQueries(context, queryCount - result.queries.length);
        result.queries.push(...fallbackQueries);
      }

      // Trim to exact count if we have too many
      result.queries = result.queries.slice(0, queryCount);

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
      `Top 10 ${industry.toLowerCase()} companies in 2025`,
      `Who are the best ${industry.toLowerCase()} providers?`,
      `Leading ${industry.toLowerCase()} companies to work with`,
      `Top ${primaryKeyword} companies in the industry`,
      `Which ${industry.toLowerCase()} companies are most trusted?`,
      `Best ${industry.toLowerCase()} firms for businesses`,
      `Who leads the ${industry.toLowerCase()} market?`,
      `Most reliable ${industry.toLowerCase()} companies`,
      `Top-rated ${industry.toLowerCase()} service providers`,
      `Which companies dominate the ${industry.toLowerCase()} space?`,
      `Best ${primaryKeyword} specialists and experts`,
      `Industry leaders in ${industry.toLowerCase()}`,
      `Top performing ${industry.toLowerCase()} companies`,
      `Highest rated ${primaryKeyword} providers`,
      `Most recommended ${industry.toLowerCase()} companies`,
      `Elite ${industry.toLowerCase()} companies worth considering`,
      `Premier ${primaryKeyword} companies in the market`,
      `Top-tier ${industry.toLowerCase()} service providers`,
      `Which ${industry.toLowerCase()} companies are industry leaders?`,
      `Best ${primaryKeyword} companies for professional services`
    ];

    return allQueries.slice(0, queryCount);
  }

  private generateDirectBusinessQuery(context: BusinessContext): string {
    const { businessName, industry, location } = context;
    
    // Create variations of direct business queries
    const queryTemplates = [
      `What can you tell me about ${businessName}?`,
      `Tell me about ${businessName} company`,
      `What does ${businessName} do?`,
      `Information about ${businessName}`,
      `${businessName} company overview`,
      `What services does ${businessName} provide?`,
      `${businessName} business information`
    ];
    
    // If location is provided, add location-specific queries
    if (location) {
      queryTemplates.push(
        `${businessName} in ${location}`,
        `Tell me about ${businessName} located in ${location}`,
        `${businessName} ${location} company`
      );
    }
    
    // Pick a random template to add variety
    const randomIndex = Math.floor(Math.random() * queryTemplates.length);
    return queryTemplates[randomIndex];
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
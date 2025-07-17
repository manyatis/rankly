import OpenAI from 'openai';

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

    const systemPrompt = `You are an expert in Answer Engine Optimization (AEO) and understand how AI systems respond to queries. Your task is to generate diverse, strategic search queries that would likely trigger AI responses where businesses in specific industries should appear.

IMPORTANT: Do NOT include any specific business names in the queries. The goal is to create generic industry queries that would naturally mention businesses in that industry.

Your goal is to create queries that:
1. Are realistic questions people actually ask AI assistants
2. Would naturally include mentions of businesses in the given industry
3. Cover different types of searches (informational, comparison, recommendation, problem-solving)
4. Include variations in query complexity and specificity
5. Target different user intents and search scenarios

Generate queries that would test visibility across various contexts where businesses should appear.`;

    const userPrompt = `Business Context:
- Industry: ${industry}
- Market/Customers: ${marketDescription}
- Primary Keywords: ${keywords.join(', ')}

Generate ${queryCount} diverse search queries that would be relevant for testing businesses in this industry. These should be natural questions that potential customers or industry researchers might ask.

IMPORTANT: Do NOT include any specific business names in the queries.

Include queries that cover:
- General industry recommendations
- Problem-solving scenarios
- Comparison requests
- "Best of" type questions
- Specific use case inquiries

IMPORTANT: Avoid location-based or geographic queries unless location/region is specifically mentioned in the industry, market description, or keywords.

Return ONLY a JSON object with this structure:
{
  "queries": ["query1", "query2", ...]
}`;
  
// "reasoning": "Brief explanation of the strategy behind these query selections"
    try {
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
        result.queries = this.generateFallbackQueries(context, queryCount);
      }

      return result;
    } catch (error) {
      console.error('Error generating optimized prompts:', error);
      
      // Fallback to default query generation
      return {
        queries: this.generateFallbackQueries(context, queryCount)
      };
    }
  }

  private generateFallbackQueries(context: BusinessContext, queryCount: number = 2): string[] {
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
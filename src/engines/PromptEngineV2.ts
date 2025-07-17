import { QueryGenerationEngine } from './QueryGenerationEngine';
import { BusinessNameVariationEngine } from './BusinessNameVariationEngine';
import { SearchPromptEngine } from './SearchPromptEngine';

/**
 * Unified Prompt Engine that coordinates all prompt-related operations
 */
export class PromptEngineV2 {
  
  /**
   * Generate keyword-based queries for AEO analysis
   */
  static async generateKeywordBasedQueries(
    businessName: string, 
    keywords: string[], 
    maxQueries?: number
  ): Promise<string[]> {
    return QueryGenerationEngine.generateKeywordBasedQueries(businessName, keywords, maxQueries);
  }

  /**
   * Generate business name variations for comprehensive search coverage
   */
  static generateBusinessNameVariations(businessName: string): string[] {
    return BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
  }

  /**
   * Create search prompts for web search operations
   */
  static async createSearchPrompt(businessDescription: string): Promise<string> {
    return SearchPromptEngine.createSearchPrompt(businessDescription);
  }

  /**
   * Create search prompts synchronously (for backward compatibility)
   */
  static createSearchPromptSync(businessDescription: string): string {
    return SearchPromptEngine.createSearchPromptSync(businessDescription);
  }
}
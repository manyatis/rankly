import { readFile } from 'fs/promises';
import { join } from 'path';

interface QueryVariationPattern {
  patterns: string[];
}

export class PromptTemplateLoader {
  private static readonly PROMPTS_BASE_PATH = join(process.cwd(), 'src', 'prompts');

  /**
   * Load a text-based prompt template and replace placeholders
   */
  static async loadTextPrompt(category: string, fileName: string, variables: Record<string, string> = {}): Promise<string> {
    const filePath = join(this.PROMPTS_BASE_PATH, category, fileName);
    
    try {
      let content = await readFile(filePath, 'utf-8');
      
      // Replace template variables
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      });
      
      return content;
    } catch (error) {
      throw new Error(`Failed to load prompt template: ${filePath}. ${error}`);
    }
  }

  /**
   * Load a JSON-based query variation pattern
   */
  static async loadQueryVariations(fileName: string): Promise<string[]> {
    const filePath = join(this.PROMPTS_BASE_PATH, 'query-variations', fileName);
    
    try {
      const content = await readFile(filePath, 'utf-8');
      const parsed: QueryVariationPattern = JSON.parse(content);
      return parsed.patterns;
    } catch (error) {
      throw new Error(`Failed to load query variations: ${filePath}. ${error}`);
    }
  }

  /**
   * Load system prompt for AEO optimization
   */
  static async loadAEOSystemPrompt(): Promise<string> {
    return this.loadTextPrompt('system', 'aeo-optimization.txt');
  }

  /**
   * Load user prompt for generating queries
   */
  static async loadGenerateQueriesPrompt(variables: {
    industry: string;
    marketDescription: string;
    keywords: string;
    queryCount: string;
  }): Promise<string> {
    return this.loadTextPrompt('user', 'generate-queries.txt', variables);
  }

  /**
   * Load web search prompt
   */
  static async loadWebSearchPrompt(variables: {
    currentDate: string;
    businessDescription: string;
  }): Promise<string> {
    return this.loadTextPrompt('web-search', 'basic-search.txt', variables);
  }

  /**
   * Load fallback query patterns
   */
  static async loadFallbackQueries(): Promise<string[]> {
    const filePath = join(this.PROMPTS_BASE_PATH, 'fallback-queries.json');
    
    try {
      const content = await readFile(filePath, 'utf-8');
      const parsed: QueryVariationPattern = JSON.parse(content);
      return parsed.patterns;
    } catch (error) {
      throw new Error(`Failed to load fallback queries: ${filePath}. ${error}`);
    }
  }

  /**
   * Generic prompt loader for new agentic analysis templates
   */
  static async loadPrompt(templatePath: string, variables: Record<string, string> = {}): Promise<string> {
    const filePath = join(this.PROMPTS_BASE_PATH, templatePath);
    
    try {
      let content = await readFile(filePath, 'utf-8');
      
      // Replace template variables
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'g'), value);
      });
      
      return content;
    } catch (error) {
      throw new Error(`Failed to load prompt template: ${filePath}. ${error}`);
    }
  }

  /**
   * Load all query variation types
   */
  static async loadAllQueryVariations(): Promise<{
    customerStyle2025: string[];
    conversationalSpecific: string[];
    comparisonEvaluation: string[];
    multiKeyword: string[];
  }> {
    const [customerStyle2025, conversationalSpecific, comparisonEvaluation, multiKeyword] = await Promise.all([
      this.loadQueryVariations('customer-style-2025.json'),
      this.loadQueryVariations('conversational-specific.json'),
      this.loadQueryVariations('comparison-evaluation.json'),
      this.loadQueryVariations('multi-keyword.json')
    ]);

    return {
      customerStyle2025,
      conversationalSpecific,
      comparisonEvaluation,
      multiKeyword
    };
  }
}
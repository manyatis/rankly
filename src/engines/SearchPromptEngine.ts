import { PromptTemplateLoader } from '../lib/PromptTemplateLoader';

export class SearchPromptEngine {
  
  /**
   * Create a search prompt for web search
   */
  static async createSearchPrompt(businessDescription: string): Promise<string> {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return PromptTemplateLoader.loadWebSearchPrompt({
      currentDate,
      businessDescription
    });
  }

  /**
   * Create a search prompt synchronously (for backward compatibility)
   */
  static createSearchPromptSync(businessDescription: string): string {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return `Search the web and find current information as of ${currentDate} for: ${businessDescription}

Please provide ONLY a concise list of company names, business names, website names, or people names that are currently active and relevant to this query. Include both established companies and newer market entrants. Do not include descriptions, explanations, or additional information. Format as a simple list with one name per line. Be brief and direct.

Focus on companies that are currently operating and visible in the market today.`;
  }
}
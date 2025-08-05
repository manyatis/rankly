import { ModelFactory } from '../lib/ai-models';
import { PromptTemplateLoader } from '../lib/PromptTemplateLoader';

export interface ExtractedBusinessInfo {
  businessName: string;
  industry: string;
  location?: string;
  businessDescription: string;
  keywords: string[];
  confidence: number; // 0-100 score of how confident we are in the extraction
}

export interface WebsiteExtractionRequest {
  url: string;
}

export class WebsiteInfoExtractionService {
  static async extractBusinessInfo(request: WebsiteExtractionRequest): Promise<ExtractedBusinessInfo> {
    const { url } = request;
    
    console.debug(`🌐 Starting business info extraction for: ${url}`);
    
    // Use OpenAI with web search to analyze the website
    const extractedInfo = await this.analyzeWebsiteWithSearch(url);
    
    console.debug(`✅ Business info extraction complete for ${url}`);
    console.debug(`   Business: ${extractedInfo.businessName}`);
    console.debug(`   Industry: ${extractedInfo.industry}`);
    console.debug(`   Location: ${extractedInfo.location || 'Not specified'}`);
    console.debug(`   Keywords: ${extractedInfo.keywords.length} found`);
    console.debug(`   Confidence: ${extractedInfo.confidence}%`);
    
    return extractedInfo;
  }
  
  private static async analyzeWebsiteWithSearch(url: string): Promise<ExtractedBusinessInfo> {
    const prompt = await PromptTemplateLoader.loadWebsiteExtractionPrompt(url);

    try {
      console.debug(`🤖 Analyzing website with AI: ${url}`);
      
      // Use OpenAI to research the website
      const response = await ModelFactory.queryModel('openai', prompt);
      
      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const parsedInfo = JSON.parse(jsonMatch[0]) as ExtractedBusinessInfo;
      
      // Validate the response
      if (!parsedInfo.businessName || !parsedInfo.industry || !parsedInfo.businessDescription) {
        throw new Error('Missing required fields in AI response');
      }
      
      // Ensure keywords is an array and limit to 10
      if (!Array.isArray(parsedInfo.keywords)) {
        parsedInfo.keywords = [];
      }
      parsedInfo.keywords = parsedInfo.keywords.slice(0, 10);
      
      // Ensure confidence is a number between 0-100
      if (typeof parsedInfo.confidence !== 'number' || parsedInfo.confidence < 0 || parsedInfo.confidence > 100) {
        parsedInfo.confidence = 50; // Default confidence
      }
      
      return parsedInfo;
      
    } catch (error) {
      console.error(`❌ Failed to analyze website with web search:`, error);
      
      // Return a fallback response
      const domain = new URL(url).hostname.replace('www.', '');
      return {
        businessName: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
        industry: 'Business Services',
        location: undefined,
        businessDescription: `A business operating at ${domain}. Unable to extract detailed information from the website.`,
        keywords: [domain.split('.')[0], 'business', 'services'],
        confidence: 20
      };
    }
  }
}
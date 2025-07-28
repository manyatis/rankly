import { ModelFactory } from '../lib/ai-models';

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
    const prompt = `I need you to research and analyze the business website at: ${url}

Please search for information about this website and business, then extract comprehensive business information and provide it in the following JSON format:

{
  "businessName": "The main business/company name",
  "industry": "The primary industry/sector (e.g., 'Software Development', 'Healthcare', 'E-commerce', 'Booking Platform', 'Banking', 'Financial Servies')",
  "location": "Physical location if mentioned (city, state/country) or null if remote/not specified",
  "businessDescription": "A 2-3 sentence description of what the business does and who they serve",
  "keywords": ["array", "of", "5-10", "relevant", "SEO", "keywords"],
  "confidence": 85
}

Guidelines for extraction:
- businessName: Extract the main company/brand name, not taglines or slogans
- industry: Use standard industry categories that would be searchable
- location: Only include if there's a clear physical address or location mentioned; use null for remote/online-only businesses  
- businessDescription: Focus on what they actually do and who they serve, avoid marketing fluff
- keywords: Include industry terms, services offered, and relevant search terms someone might use to find this business
- confidence: Rate 0-100 based on how clear and complete the information you can find about this business is

Please research this website and business thoroughly to extract the most accurate information possible.

Return only the JSON object, no additional text or explanation:`;

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
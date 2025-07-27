import { ModelFactory } from '../lib/ai-models';

export interface WebsiteAnalysisRequest {
  url: string;
  businessName: string;
  industry: string;
  recommendationLimit?: number;
}

export interface AnalysisRecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'quick' | 'moderate' | 'significant';
  impact: 'high' | 'medium' | 'low';
}

export interface WebsiteAnalysisResult {
  url: string;
  title: string;
  contentAnalysis: {
    wordCount: number;
    hasStructuredData: boolean;
    headingStructure: string[];
    authoritySignals: string[];
    citationCount: number;
  };
  aeoOptimization: {
    currentScore: number;
    strengths: string[];
    weaknesses: string[];
  };
  recommendations: AnalysisRecommendation[];
  summary: string;
}

export class WebsiteAnalysisService {
  private static readonly DEFAULT_RECOMMENDATION_LIMIT = 3;

  static async analyzeWebsite(request: WebsiteAnalysisRequest): Promise<WebsiteAnalysisResult> {
    const { url, businessName, industry, recommendationLimit = this.DEFAULT_RECOMMENDATION_LIMIT } = request;
    
    console.debug(`🌐 Starting website analysis for ${url}`);
    
    try {
      // Fetch website content
      const websiteContent = await this.fetchWebsiteContent(url);
      
      // Analyze content structure
      const contentAnalysis = this.analyzeContentStructure(websiteContent);
      
      // Generate AI-powered AEO analysis
      const aeoAnalysis = await this.generateAEOAnalysis(websiteContent, businessName, industry);
      
      // Generate actionable recommendations
      const recommendations = await this.generateRecommendations(
        contentAnalysis, 
        aeoAnalysis, 
        businessName, 
        industry,
        recommendationLimit
      );
      
      return {
        url,
        title: this.extractTitle(websiteContent),
        contentAnalysis,
        aeoOptimization: aeoAnalysis,
        recommendations,
        summary: this.generateSummary(aeoAnalysis, recommendations)
      };
      
    } catch (error) {
      console.error(`❌ Website analysis failed for ${url}:`, error);
      throw new Error(`Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async fetchWebsiteContent(url: string): Promise<string> {
    console.debug(`🔄 Fetching content from ${url}`);
    
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SearchDogAI-AEO-Analyzer/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      console.debug(`✅ Fetched ${content.length} characters from ${url}`);
      return content;
      
    } catch (error) {
      console.error(`❌ Failed to fetch ${url}:`, error);
      throw new Error(`Could not fetch website content: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  }

  private static analyzeContentStructure(html: string): WebsiteAnalysisResult['contentAnalysis'] {
    // Extract text content (simplified HTML parsing)
    const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                           .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                           .replace(/<[^>]*>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim();
    
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    // Check for structured data
    const hasStructuredData = /application\/ld\+json|schema\.org|itemscope|microdata/i.test(html);
    
    // Extract heading structure
    const headingMatches = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];
    const headingStructure = headingMatches.slice(0, 10).map(h => 
      h.replace(/<[^>]*>/g, '').trim()
    );
    
    // Look for authority signals
    const authoritySignals = [];
    if (/testimonial|review|rating/i.test(html)) authoritySignals.push('Customer testimonials');
    if (/certification|certified|award/i.test(html)) authoritySignals.push('Certifications/Awards');
    if (/year|since|established|founded/i.test(html)) authoritySignals.push('Business history');
    if (/team|about|staff|expert/i.test(html)) authoritySignals.push('Team/expertise');
    if (/press|media|news/i.test(html)) authoritySignals.push('Press coverage');
    
    // Count potential citations/references
    const citationCount = (html.match(/href="[^"]*"/g) || []).length;
    
    return {
      wordCount,
      hasStructuredData,
      headingStructure,
      authoritySignals,
      citationCount
    };
  }

  private static async generateAEOAnalysis(
    html: string, 
    businessName: string, 
    industry: string
  ): Promise<WebsiteAnalysisResult['aeoOptimization']> {
    
    const analysisPrompt = `Analyze this website content for Answer Engine Optimization (AEO) and Google Enterprise Optimization (GEO).

Business: ${businessName}
Industry: ${industry}

Website Content (first 3000 chars):
${html.substring(0, 3000)}

Evaluate the content for AEO/GEO optimization on a scale of 1-100 considering:
1. Authoritative voice and expertise demonstration
2. Use of statistics, data, and citations
3. Content structure and clarity
4. Industry authority signals
5. Factual, referenced information
6. Answer-focused content structure

Provide:
1. A score out of 100
2. 3 key strengths
3. 3 key weaknesses

Format as JSON: {"score": number, "strengths": [string], "weaknesses": [string]}`;

    try {
      const response = await ModelFactory.queryModel('openai', analysisPrompt);
      const parsed = JSON.parse(response);
      
      return {
        currentScore: parsed.score || 50,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || []
      };
    } catch (error) {
      console.warn(`⚠️ AI analysis failed, using fallback:`, error);
      return {
        currentScore: 60,
        strengths: ['Content is present', 'Website is accessible', 'Basic structure exists'],
        weaknesses: ['Limited authority signals', 'Could improve data citations', 'May need more structured content']
      };
    }
  }

  private static async generateRecommendations(
    contentAnalysis: WebsiteAnalysisResult['contentAnalysis'],
    aeoAnalysis: WebsiteAnalysisResult['aeoOptimization'],
    businessName: string,
    industry: string,
    limit: number
  ): Promise<AnalysisRecommendation[]> {
    
    const recommendationPrompt = `Based on this website analysis, generate exactly ${limit} specific, actionable AEO/GEO optimization recommendations.

Business: ${businessName}
Industry: ${industry}

Current Analysis:
- AEO Score: ${aeoAnalysis.currentScore}/100
- Word Count: ${contentAnalysis.wordCount}
- Has Structured Data: ${contentAnalysis.hasStructuredData}
- Authority Signals: ${contentAnalysis.authoritySignals.join(', ')}

Strengths: ${aeoAnalysis.strengths.join(', ')}
Weaknesses: ${aeoAnalysis.weaknesses.join(', ')}

Generate exactly ${limit} recommendations focused on:
- More authoritative voice
- Use more quotes/statistics 
- Reference more reports/studies
- Create blog sections with keywords
- Structure data better
- Improve industry authority

Each recommendation should have:
- category: (Content, Technical, Authority, Structure)
- title: Brief actionable title
- description: 2-3 sentences explaining the action
- priority: high/medium/low
- effort: quick/moderate/significant  
- impact: high/medium/low

Format as JSON array: [{"category": "", "title": "", "description": "", "priority": "", "effort": "", "impact": ""}]`;

    try {
      const response = await ModelFactory.queryModel('openai', recommendationPrompt);
      const parsed = JSON.parse(response);
      
      // Ensure we return exactly the requested number of recommendations
      const recommendations = Array.isArray(parsed) ? parsed.slice(0, limit) : [];
      
      // Fill with default recommendations if AI didn't provide enough
      while (recommendations.length < limit) {
        recommendations.push(this.getDefaultRecommendation(recommendations.length + 1, industry));
      }
      
      return recommendations;
      
    } catch (error) {
      console.warn(`⚠️ Recommendation generation failed, using defaults:`, error);
      return this.getDefaultRecommendations(limit, industry);
    }
  }

  private static getDefaultRecommendation(index: number, industry: string): AnalysisRecommendation {
    const defaults = [
      {
        category: 'Authority',
        title: 'Add Industry Statistics and Data',
        description: `Include recent industry statistics, market data, and research findings throughout your content. Reference authoritative sources like industry reports, government data, or academic studies to establish expertise in ${industry}.`,
        priority: 'high' as const,
        effort: 'moderate' as const,
        impact: 'high' as const
      },
      {
        category: 'Content',
        title: 'Create Expert Quote Sections',
        description: 'Add quotes from industry experts, customer testimonials, or case study results. This establishes authority and provides AI engines with quotable, factual content that demonstrates real-world application.',
        priority: 'high' as const,
        effort: 'moderate' as const,
        impact: 'medium' as const
      },
      {
        category: 'Structure',
        title: 'Implement FAQ Schema Markup',
        description: 'Add structured data markup for frequently asked questions. This helps AI engines understand and extract key information about your services, making your content more likely to appear in AI responses.',
        priority: 'medium' as const,
        effort: 'quick' as const,
        impact: 'high' as const
      }
    ];
    
    return defaults[(index - 1) % defaults.length];
  }

  private static getDefaultRecommendations(limit: number, industry: string): AnalysisRecommendation[] {
    const recommendations = [];
    for (let i = 1; i <= limit; i++) {
      recommendations.push(this.getDefaultRecommendation(i, industry));
    }
    return recommendations;
  }

  private static extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : 'Website Analysis';
  }

  private static generateSummary(
    aeoAnalysis: WebsiteAnalysisResult['aeoOptimization'], 
    recommendations: AnalysisRecommendation[]
  ): string {
    const scoreDescription = aeoAnalysis.currentScore >= 80 ? 'excellent' : 
                           aeoAnalysis.currentScore >= 60 ? 'good' : 
                           aeoAnalysis.currentScore >= 40 ? 'fair' : 'needs improvement';
    
    const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
    
    return `Your website has a ${scoreDescription} AEO score of ${aeoAnalysis.currentScore}/100. ` +
           `${highPriorityCount} high-priority recommendations focus on improving authority signals, ` +
           `content structure, and industry expertise to boost AI engine visibility.`;
  }
}
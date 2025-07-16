import { QueryResult } from './AnalyticalEngine';

export interface ScoringFactors {
  accuracy: number;
  relevance: number;
  completeness: number;
  brandMention: number;
  citations: number;
  visibility: number;
  ranking: number;
}

export interface CompetitorInfo {
  name: string;
  mentions: number;
  score: number;
}

export interface ScoringResult {
  aeoScore: number;
  factors: ScoringFactors;
  analysis: string;
  overallVisibility: number;
  competitorAnalysis: CompetitorInfo[];
  missedResponses: QueryResult[];
}

export class RankingEngine {
  static calculateEnhancedAEOScore(
    queryResults: QueryResult[],
    businessName: string,
    keywords: string[]
  ): ScoringResult {
    console.log(`\n📊 Calculating AEO score for "${businessName}"`);
    console.log(`📈 Query results summary: ${queryResults.length} total queries`);

    const factors: ScoringFactors = {
      accuracy: 0,
      relevance: 0,
      completeness: 0,
      brandMention: 0,
      citations: 0,
      visibility: 0,
      ranking: 0
    };

    const totalQueries = queryResults.length;
    const mentionedQueries = queryResults.filter(r => r.mentioned).length;
    const validResponses = queryResults.filter(r => !r.response.startsWith('Error')).length;

    console.log(`📊 Found ${mentionedQueries} mentions out of ${totalQueries} queries`);
    console.log(`📊 ${validResponses} valid responses (non-error)`);

    // Calculate visibility score
    factors.visibility = totalQueries > 0 ? Math.round((mentionedQueries / totalQueries) * 100) : 0;
    console.log(`📊 Visibility score: ${factors.visibility}%`);

    // Calculate relevance and ranking scores
    if (mentionedQueries > 0) {
      const avgRelevance = queryResults
        .filter(r => r.mentioned)
        .reduce((sum, r) => sum + r.relevanceScore, 0) / mentionedQueries;
      factors.relevance = Math.round(avgRelevance);
      console.log(`📊 Average relevance score: ${factors.relevance}`);

      const avgRankPosition = queryResults
        .filter(r => r.mentioned && r.rankPosition > 0)
        .reduce((sum, r) => sum + r.rankPosition, 0) / Math.max(mentionedQueries, 1);
      factors.ranking = Math.round(Math.max(0, 100 - (avgRankPosition - 1) * 25));
      console.log(`📊 Average rank position: ${avgRankPosition.toFixed(2)} → ranking score: ${factors.ranking}`);

      factors.brandMention = factors.visibility;
    }

    // Calculate accuracy score
    factors.accuracy = validResponses > 0 ? Math.round((validResponses / totalQueries) * 100) : 0;
    console.log(`📊 Accuracy score: ${factors.accuracy}%`);

    // Calculate completeness score
    const responseLengths = queryResults
      .filter(r => r.mentioned)
      .map(r => r.response.length);
    const avgLength = responseLengths.length > 0
      ? responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length
      : 0;
    factors.completeness = Math.min(100, Math.round((avgLength / 300) * 100));

    // Calculate citation score
    const citationCount = queryResults.filter(r =>
      r.response.includes('http') ||
      r.response.includes('www.') ||
      r.response.includes('source') ||
      r.response.includes('according to')
    ).length;
    factors.citations = totalQueries > 0 ? Math.round((citationCount / totalQueries) * 100) : 0;

    // Calculate final AEO score
    const aeoScore = Math.round(
      (factors.visibility * 0.3) +
      (factors.relevance * 0.25) +
      (factors.ranking * 0.2) +
      (factors.brandMention * 0.15) +
      (factors.completeness * 0.05) +
      (factors.citations * 0.05)
    );

    console.log(`🏆 Final AEO Score calculation:`);
    console.log(`   Visibility (30%): ${factors.visibility} × 0.3 = ${(factors.visibility * 0.3).toFixed(1)}`);
    console.log(`   Relevance (25%): ${factors.relevance} × 0.25 = ${(factors.relevance * 0.25).toFixed(1)}`);
    console.log(`   Ranking (20%): ${factors.ranking} × 0.2 = ${(factors.ranking * 0.2).toFixed(1)}`);
    console.log(`   Brand Mention (15%): ${factors.brandMention} × 0.15 = ${(factors.brandMention * 0.15).toFixed(1)}`);
    console.log(`   Completeness (5%): ${factors.completeness} × 0.05 = ${(factors.completeness * 0.05).toFixed(1)}`);
    console.log(`   Citations (5%): ${factors.citations} × 0.05 = ${(factors.citations * 0.05).toFixed(1)}`);
    console.log(`🎯 TOTAL AEO SCORE: ${aeoScore}/100`);

    const overallVisibility = factors.visibility;

    // Generate analysis
    const analysis = this.generateAnalysis(aeoScore, businessName, mentionedQueries, totalQueries, keywords);

    // Perform competitor analysis
    const competitorAnalysis = this.analyzeCompetitors(queryResults, businessName);

    // Get missed responses
    const missedResponses = queryResults.filter(r => !r.mentioned && !r.response.startsWith('Error'));

    return {
      aeoScore,
      factors,
      analysis,
      overallVisibility,
      competitorAnalysis,
      missedResponses
    };
  }

  private static generateAnalysis(aeoScore: number, businessName: string, mentionedQueries: number, totalQueries: number, keywords: string[]): string {
    let analysis = '';
    
    if (aeoScore >= 80) {
      analysis = `Excellent AEO performance! ${businessName} appears in ${mentionedQueries}/${totalQueries} AI queries with high relevance. Strong AI visibility across multiple query types.`;
    } else if (aeoScore >= 60) {
      analysis = `Good AEO score. ${businessName} appears in ${mentionedQueries}/${totalQueries} queries. Focus on improving content structure and online presence for better AI recognition.`;
    } else if (aeoScore >= 40) {
      analysis = `Fair AEO performance. ${businessName} appears in ${mentionedQueries}/${totalQueries} queries. Significant optimization needed for better AI engine visibility and ranking.`;
    } else {
      analysis = `Poor AEO score. ${businessName} appears in only ${mentionedQueries}/${totalQueries} queries. Critical optimization needed to improve AI engine recognition and ranking.`;
    }

    // Add context about keywords
    if (keywords.length > 3) {
      analysis += ` Your ${keywords.length} keywords provide comprehensive context for AI analysis.`;
    }

    return analysis;
  }

  private static analyzeCompetitors(queryResults: QueryResult[], businessName: string): CompetitorInfo[] {
    const competitorMentions = new Map<string, number>();
    
    queryResults.forEach(result => {
      if (!result.response.startsWith('Error')) {
        const companies = this.extractCompanyNames(result.response, businessName);
        companies.forEach(company => {
          competitorMentions.set(company, (competitorMentions.get(company) || 0) + 1);
        });
      }
    });

    // Get top competitors (mentioned in multiple responses)
    return Array.from(competitorMentions.entries())
      .filter(([, mentions]) => mentions >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, mentions]) => ({
        name,
        mentions,
        score: Math.round((mentions / queryResults.filter(r => !r.response.startsWith('Error')).length) * 100)
      }));
  }

  private static extractCompanyNames(text: string, businessName: string): string[] {
    const companies = new Set<string>();
    
    // Common words that are NOT company names
    const excludeWords = new Set([
      'AEO', 'SEO', 'AI', 'API', 'SaaS', 'B2B', 'B2C', 'CRM', 'ERP', 'HR', 'IT', 'UI', 'UX',
      'Marketing', 'Advertising', 'Sales', 'Business', 'Technology', 'Software', 'Hardware',
      'Service', 'Services', 'Solutions', 'Consulting', 'Management', 'Development', 'Design',
      'Analytics', 'Intelligence', 'Optimization', 'Engine', 'Platform', 'System', 'Network',
      'Digital', 'Online', 'Web', 'Mobile', 'Cloud', 'Data', 'Search', 'Social', 'Media',
      'Content', 'Strategy', 'Agency', 'Firm', 'Group', 'Team', 'Expert', 'Specialist',
      'Professional', 'Consultant', 'Manager', 'Director', 'CEO', 'CTO', 'CMO', 'VP',
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday', 'Sunday', 'Today', 'Yesterday', 'Tomorrow', 'Week', 'Month', 'Year',
      'Inc', 'LLC', 'Corp', 'Corporation', 'Company', 'Co', 'Ltd', 'Limited', 'Enterprises',
      'International', 'Global', 'USA', 'America', 'United', 'States', 'Europe', 'Asia'
    ]);

    // Pattern 1: Companies with explicit business suffixes
    const businessSuffixPattern = /\b([A-Z][a-zA-Z\s&'-]{1,40})\s+(Inc|LLC|Corp|Corporation|Company|Co|Ltd|Limited|Solutions|Services|Group|Enterprises|International|Global|USA|America)\.?\b/gi;
    let match;
    while ((match = businessSuffixPattern.exec(text)) !== null) {
      const fullName = match[0].trim().replace(/[.,;:]$/, '');
      const baseName = match[1].trim();
      
      if (this.isValidCompanyName(baseName, businessName, excludeWords)) {
        companies.add(fullName);
      }
    }

    // Pattern 2: Branded company names (typically 2-3 words, proper capitalization)
    const brandedCompanyPattern = /\b([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*){1,2})\b/g;
    while ((match = brandedCompanyPattern.exec(text)) !== null) {
      const candidate = match[1].trim();
      
      if (this.isValidCompanyName(candidate, businessName, excludeWords) && 
          candidate.length >= 4 && candidate.length <= 50) {
        companies.add(candidate);
      }
    }

    // Pattern 3: Companies mentioned in lists (e.g., "1. CompanyName", "- CompanyName")
    const listPattern = /(?:^\s*[\d\-\*•]\s*|,\s*)([A-Z][a-zA-Z\s&'-]{2,30})(?=\s*[,\n\r]|$)/gm;
    while ((match = listPattern.exec(text)) !== null) {
      const candidate = match[1].trim().replace(/[.,;:]$/, '');
      
      if (this.isValidCompanyName(candidate, businessName, excludeWords)) {
        companies.add(candidate);
      }
    }

    // Pattern 4: Companies with domain-like names (e.g., "CompanyName.com" -> "CompanyName")
    const domainPattern = /\b([A-Z][a-zA-Z]{2,20})\.(?:com|net|org|io|co|ai)\b/gi;
    while ((match = domainPattern.exec(text)) !== null) {
      const candidate = match[1].trim();
      
      if (this.isValidCompanyName(candidate, businessName, excludeWords)) {
        companies.add(candidate);
      }
    }

    return Array.from(companies);
  }

  private static isValidCompanyName(candidate: string, businessName: string, excludeWords: Set<string>): boolean {
    // Basic validation
    if (candidate.length < 2 || candidate.length > 50) return false;
    
    // Don't include the business being analyzed
    if (candidate.toLowerCase().includes(businessName.toLowerCase()) || 
        businessName.toLowerCase().includes(candidate.toLowerCase())) {
      return false;
    }
    
    // Check against exclude words
    const words = candidate.split(/\s+/);
    if (words.some(word => excludeWords.has(word))) return false;
    
    // Must start with capital letter
    if (!/^[A-Z]/.test(candidate)) return false;
    
    // Should not be all caps (likely an acronym)
    if (candidate === candidate.toUpperCase() && candidate.length > 1) return false;
    
    // Should not contain numbers (unless it's part of a brand like "3M")
    if (/\d/.test(candidate) && !/^[A-Z]*\d+[A-Z]*$/.test(candidate)) return false;
    
    // Should not be too generic
    const genericTerms = ['company', 'business', 'service', 'solution', 'platform', 'system', 'network'];
    if (genericTerms.some(term => candidate.toLowerCase().includes(term))) return false;
    
    // Should have reasonable word structure
    const wordCount = words.length;
    if (wordCount > 4) return false; // Too many words
    
    // Each word should be reasonable length
    if (words.some(word => word.length < 2 || word.length > 20)) return false;
    
    return true;
  }
}
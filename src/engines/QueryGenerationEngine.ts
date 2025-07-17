import { PromptTemplateLoader } from '../lib/PromptTemplateLoader';
import { KeywordCombinationEngine } from './KeywordCombinationEngine';

export class QueryGenerationEngine {
  private static readonly MAX_QUERIES = parseInt(process.env.MAX_AEO_QUERIES || '2');

  /**
   * Generate keyword-based queries using template patterns
   */
  static async generateKeywordBasedQueries(
    businessName: string, 
    keywords: string[], 
    maxQueries: number = this.MAX_QUERIES
  ): Promise<string[]> {
    console.log(`🎯 Generating ${maxQueries} queries for business: "${businessName}" with keywords:`, keywords);

    const variations: string[] = [];
    const keywordCombinations = KeywordCombinationEngine.generateKeywordCombinations(keywords);
    console.log(`🔄 Generated ${keywordCombinations.length} keyword combinations:`, keywordCombinations);

    try {
      // Load all query variation patterns
      const queryPatterns = await PromptTemplateLoader.loadAllQueryVariations();

      // Priority 1: Customer-style queries for 2025
      keywords.forEach(keyword => {
        queryPatterns.customerStyle2025.forEach(pattern => {
          variations.push(pattern.replace(/{{keyword}}/g, keyword));
        });
      });

      // Priority 2: Conversational and specific queries
      keywords.forEach(keyword => {
        queryPatterns.conversationalSpecific.forEach(pattern => {
          variations.push(pattern.replace(/{{keyword}}/g, keyword));
        });
      });

      // Priority 3: Comparison and evaluation queries
      keywords.forEach(keyword => {
        queryPatterns.comparisonEvaluation.forEach(pattern => {
          variations.push(pattern.replace(/{{keyword}}/g, keyword));
        });
      });

      // Priority 4: Multi-keyword combinations (if applicable)
      if (keywordCombinations.length > 1) {
        keywordCombinations.slice(0, 2).forEach(combo => {
          const keywordPhrase = combo.join(' ');
          queryPatterns.multiKeyword.forEach(pattern => {
            variations.push(pattern.replace(/{{keywordPhrase}}/g, keywordPhrase));
          });
        });
      }

      // Shuffle and take the requested number
      const shuffled = variations.sort(() => Math.random() - 0.5);
      const finalQueries = shuffled.slice(0, maxQueries);

      console.log(`📝 Selected ${finalQueries.length} queries from ${variations.length} possibilities:`);
      finalQueries.forEach((query, index) => {
        console.log(`   ${index + 1}. "${query}"`);
      });

      return finalQueries;

    } catch (error) {
      console.error('Failed to load query patterns, falling back to legacy method:', error);
      return this.generateKeywordBasedQueriesLegacy(businessName, keywords, maxQueries);
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  private static generateKeywordBasedQueriesLegacy(
    businessName: string, 
    keywords: string[], 
    maxQueries: number
  ): string[] {
    const variations: string[] = [];
    const keywordCombinations = KeywordCombinationEngine.generateKeywordCombinations(keywords);

    // Priority 1: Customer-style queries for 2025
    keywords.forEach(keyword => {
      variations.push(
        `I am looking for the top 2025 companies who do ${keyword}`,
        `Give me the top companies in the ${keyword} industry in 2025`,
        `Who are the best ${keyword} companies to work with in 2025?`,
        `What are the leading ${keyword} businesses right now?`,
        `Show me the most recommended ${keyword} companies`,
        `I need to find reliable ${keyword} service providers`,
        `Which ${keyword} companies are trending in 2025?`,
        `Best ${keyword} companies for businesses in 2025`
      );
    });

    // Priority 2: Conversational and specific queries
    keywords.forEach(keyword => {
      variations.push(
        `Can you recommend top ${keyword} companies?`,
        `I'm researching ${keyword} providers - who are the leaders?`,
        `What companies should I consider for ${keyword} services?`,
        `Who dominates the ${keyword} market in 2025?`,
        `Looking for established ${keyword} companies with good reputation`,
        `Which ${keyword} firms are considered industry leaders?`,
        `Help me find the most successful ${keyword} businesses`,
        `Top-rated ${keyword} companies and service providers`
      );
    });

    // Priority 3: Comparison and evaluation queries
    keywords.forEach(keyword => {
      variations.push(
        `Compare the top ${keyword} companies in the market`,
        `Rank the best ${keyword} service providers`,
        `Which ${keyword} companies have the best reviews?`,
        `Most trusted ${keyword} companies for enterprises`,
        `Premium ${keyword} companies worth considering`,
        `Established ${keyword} companies with proven track record`
      );
    });

    // Priority 4: Multi-keyword combinations (if applicable)
    if (keywordCombinations.length > 1) {
      keywordCombinations.slice(0, 2).forEach(combo => {
        const keywordPhrase = combo.join(' ');
        variations.push(
          `Top ${keywordPhrase} companies in 2025`,
          `I need ${keywordPhrase} service providers`,
          `Best ${keywordPhrase} business or firms or consultants`,
          `Leading ${keywordPhrase} businesses to consider`
        );
      });
    }

    // Shuffle and take the requested number
    const shuffled = variations.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, maxQueries);
  }
}
import { WordPositionAnalysisService, WordMatch } from '../services/WordPositionAnalysisService';

export interface QueryResult {
  query: string;
  response: string;
  mentioned: boolean;
  rankPosition: number;
  relevanceScore: number;
  wordPositionData?: {
    matches: WordMatch[];
    totalMatches: number;
    averagePosition: number;
    lineNumbers: number[];
    businessMentionDensity: number;
  };
}

export class AnalyticalEngine {
  static findFuzzyMatches(businessName: string, responseText: string): Array<{ match: string, index: number, score: number }> {
    const matches: Array<{ match: string, index: number, score: number }> = [];

    // Remove all non-alphanumeric characters and convert to lowercase
    const cleanBusinessName = businessName.replace(/[^a-z0-9]/g, '');

    if (cleanBusinessName.length < 3) return matches; // Too short for fuzzy matching

    // Split business name into words for flexible matching
    const businessWords = businessName.split(/\s+/).filter(w => w.length > 1);

    // Strategy 1: Look for the business name with flexible spacing
    const regexPattern = businessWords.map(word =>
      word.split('').map(char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*')
    ).join('\\s+');

    try {
      const regex = new RegExp(regexPattern, 'gi');
      let match;
      while ((match = regex.exec(responseText)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          score: this.calculateMatchScore(businessName, match[0])
        });
      }
    } catch {
      // Regex error, skip this strategy
    }

    // Strategy 2: Look for concatenated version with word boundaries
    if (businessWords.length > 1) {
      const concatenated = businessWords.join('');
      const concatRegex = new RegExp(`\\b${concatenated.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');

      try {
        let match;
        while ((match = concatRegex.exec(responseText)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            score: this.calculateMatchScore(businessName, match[0])
          });
        }
      } catch {
        // Regex error, skip this strategy
      }
    }

    // Strategy 3: Look for individual words close together
    if (businessWords.length > 1) {
      for (let i = 0; i < businessWords.length - 1; i++) {
        const word1 = businessWords[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const word2 = businessWords[i + 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const proximityRegex = new RegExp(`\\b${word1}\\s{0,3}${word2}\\b`, 'gi');

        try {
          let match;
          while ((match = proximityRegex.exec(responseText)) !== null) {
            matches.push({
              match: match[0],
              index: match.index,
              score: this.calculateMatchScore(businessName, match[0]) * 0.8 // Lower score for partial matches
            });
          }
        } catch {
          // Regex error, skip this strategy
        }
      }
    }

    // Strategy 4: Look for significant individual words (for partial matches)
    if (businessWords.length > 1) {
      const genericWords = new Set(['the', 'and', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'bank', 'company', 'corporation', 'inc', 'llc', 'group', 'services', 'systems', 'solutions']);
      
      for (const word of businessWords) {
        if (word.length > 2 && !genericWords.has(word.toLowerCase())) {
          const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          
          try {
            let match;
            while ((match = wordRegex.exec(responseText)) !== null) {
              matches.push({
                match: match[0],
                index: match.index,
                score: this.calculateMatchScore(businessName, match[0]) * 0.6 // Partial match score
              });
            }
          } catch {
            // Regex error, skip this strategy
          }
        }
      }
    }

    // Sort by score (highest first) and return top matches
    return matches
      .filter(m => m.score > 0.2) // Lowered threshold to catch more partial matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5 matches
  }

  static calculateMatchScore(original: string, match: string): number {
    const originalClean = original.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchClean = match.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Calculate similarity based on character overlap
    let score = 0;
    const maxLength = Math.max(originalClean.length, matchClean.length);
    const minLength = Math.min(originalClean.length, matchClean.length);

    // Count matching characters
    let matchingChars = 0;
    const originalChars = originalClean.split('');
    const matchChars = matchClean.split('');

    for (const char of originalChars) {
      const index = matchChars.indexOf(char);
      if (index !== -1) {
        matchingChars++;
        matchChars.splice(index, 1); // Remove to avoid double counting
      }
    }

    // Use a more generous scoring for partial matches
    score = matchingChars / maxLength;
    
    // Bonus for good coverage of the shorter string (partial matches)
    if (minLength > 0) {
      const coverageBonus = (matchingChars / minLength) * 0.3;
      score += coverageBonus;
    }

    // Bonus for exact length match
    if (originalClean.length === matchClean.length) {
      score += 0.1;
    }

    // Bonus for word boundary matches
    if (match.match(/^\w/) && match.match(/\w$/)) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  static async analyzeWithCustomQueries(
    queryFunction: (query: string) => Promise<string>,
    businessName: string,
    customQueries: string[]
  ): Promise<QueryResult[]> {
    console.debug(`🚀 Starting AI analysis for "${businessName}" with ${customQueries.length} custom queries`);

    console.debug(`🔍 Searching for business name: "${businessName}"`);

    const results: QueryResult[] = [];

    for (let i = 0; i < customQueries.length; i++) {
      const query = customQueries[i];
      console.debug(`\n📤 Query ${i + 1}/${customQueries.length}: "${query}"`);

      try {
        const response = await queryFunction(query);
        console.debug(`📥 Response length: ${response.length} characters`);
        console.debug(`📄 Response preview: "${response.substring(0, 200)}..."`);

        const responseLower = response.toLowerCase();

        // Check if the business name appears in the response
        let mentioned = false;
        let bestMatch = '';
        let bestIndex = -1;
        let matchType = 'none';

        console.debug(`🔎 Searching for business name in response...`);

        // First try exact match
        const nameIndex = responseLower.indexOf(businessName.toLowerCase());
        if (nameIndex !== -1) {
          console.debug(`✅ EXACT MATCH "${businessName}" at position ${nameIndex}`);
          mentioned = true;
          bestIndex = nameIndex;
          bestMatch = businessName;
          matchType = 'exact';
        }

        // If no exact match, try fuzzy matching with AI reasoning
        if (!mentioned) {
          console.debug(`🔍 No exact match found, trying AI fuzzy matching...`);
          const fuzzyMatches = this.findFuzzyMatches(businessName, responseLower);
          if (fuzzyMatches.length > 0) {
            const match = fuzzyMatches[0];
            console.debug(`🎯 FUZZY MATCH "${match.match}" (score: ${match.score}) at position ${match.index}`);
            mentioned = true;
            bestIndex = match.index;
            bestMatch = match.match;
            matchType = 'fuzzy';
          }
        }

        if (!mentioned) {
          console.debug(`❌ Business name NOT found in this response`);
        } else {
          console.debug(`🎯 Best match: "${bestMatch}" at position ${bestIndex}`);
        }

        let rankPosition = 0;
        let relevanceScore = 0;

        if (mentioned) {
          // Calculate rank position based on where business appears in response
          if (bestIndex < 50) rankPosition = 1;
          else if (bestIndex < 150) rankPosition = 2;
          else if (bestIndex < 300) rankPosition = 3;
          else if (bestIndex < 500) rankPosition = 4;
          else rankPosition = 5;

          console.debug(`📍 Rank position: ${rankPosition} (found at character ${bestIndex})`);

          // Calculate relevance score using extracted method
          relevanceScore = this.calculateRelevanceScore(response, responseLower, bestMatch, bestIndex, businessName, matchType);
        }

        // Generate word position data using AI analysis
        let wordPositionData;
        try {
          console.debug(`🔍 Generating detailed word position analysis...`);
          const wordAnalysis = await WordPositionAnalysisService.analyzeWordPositions({
            businessName,
            responses: [{
              id: `query-${i}`,
              modelName: 'AI-Model',
              responseText: response,
              query
            }],
            variations: [businessName]
          });

          if (wordAnalysis.responseAnalyses.length > 0) {
            const analysis = wordAnalysis.responseAnalyses[0];
            wordPositionData = {
              matches: analysis.matches,
              totalMatches: analysis.totalMatches,
              averagePosition: analysis.matches.length > 0 ? 
                analysis.matches.reduce((sum, match) => sum + match.position, 0) / analysis.matches.length : 0,
              lineNumbers: analysis.matches.map(match => match.lineNumber),
              businessMentionDensity: analysis.businessMentionDensity
            };
            console.debug(`📊 Word position analysis: ${wordPositionData.totalMatches} matches, avg position: ${wordPositionData.averagePosition.toFixed(1)}`);
          }
        } catch (error) {
          console.error(`⚠️ Word position analysis failed, using fallback:`, error);
          // Fallback to basic position data
          if (mentioned) {
            wordPositionData = {
              matches: [{
                matchedText: bestMatch,
                position: bestIndex,
                lineNumber: this.getLineNumber(response, bestIndex),
                confidence: matchType === 'exact' ? 100 : 75,
                matchType: matchType as 'exact' | 'fuzzy' | 'partial',
                context: this.extractContext(response, bestIndex, bestMatch.length)
              }],
              totalMatches: 1,
              averagePosition: bestIndex,
              lineNumbers: [this.getLineNumber(response, bestIndex)],
              businessMentionDensity: (1 / this.countWords(response)) * 100
            };
          }
        }

        results.push({
          query,
          response,
          mentioned,
          rankPosition,
          relevanceScore,
          wordPositionData
        });

        console.debug(`✅ Query ${i + 1} completed: mentioned=${mentioned}, rank=${rankPosition}, score=${relevanceScore}`);

      } catch (error) {
        console.error(`❌ Error with query ${i + 1}: "${query}":`, error);
        results.push({
          query,
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          mentioned: false,
          rankPosition: 0,
          relevanceScore: 0
        });
      }
    }

    console.debug(`🏁 Analysis complete. Processed ${results.length} queries.`);
    return results;
  }


  private static getLineNumber(text: string, position: number): number {
    const beforePosition = text.substring(0, position);
    return beforePosition.split('\n').length;
  }

  private static extractContext(text: string, position: number, matchLength: number): string {
    const contextRadius = 20;
    const start = Math.max(0, position - contextRadius);
    const end = Math.min(text.length, position + matchLength + contextRadius);
    
    let context = text.substring(start, end);
    
    // Add ellipsis if truncated
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context;
  }

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private static calculateRelevanceScore(response: string, responseLower: string, bestMatch: string, bestIndex: number, businessName: string, matchType: string = 'exact'): number {
    let score = 0;

    // Base score for being mentioned (adjust based on match type)
    if (matchType === 'exact') {
      score += 20;
      console.debug(`📊 Base score (exact match): +20 = ${score}`);
    } else if (matchType === 'fuzzy') {
      score += 15;
      console.debug(`📊 Base score (fuzzy match): +15 = ${score}`);
    }

    // Enhanced logic for compound company names - significant partial matches
    const originalWords = businessName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (originalWords.length > 1) {
      // Define generic words to ignore
      const genericWords = new Set(['the', 'and', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'bank', 'company', 'corporation', 'inc', 'llc', 'group', 'services', 'systems', 'solutions']);
      
      let significantWordMatches = 0;
      let totalSignificantWords = 0;
      
      for (const word of originalWords) {
        if (!genericWords.has(word.toLowerCase())) {
          totalSignificantWords++;
          if (responseLower.includes(word)) {
            significantWordMatches++;
          }
        }
      }
      
      if (significantWordMatches > 0) {
        // If we have significant partial matches, treat them more favorably
        const matchRatio = significantWordMatches / totalSignificantWords;
        let wordMatchBonus = 0;
        
        if (matchRatio >= 0.5) {
          // If half or more of significant words match, this is a strong partial match
          wordMatchBonus = Math.min(25, significantWordMatches * 12);
        } else {
          // Even single significant word matches are valuable
          wordMatchBonus = Math.min(15, significantWordMatches * 8);
        }
        
        score += wordMatchBonus;
        console.debug(`📊 Significant word matches (${significantWordMatches}/${totalSignificantWords}): +${wordMatchBonus} = ${score}`);
      }
    }

    // Bonus for early mention
    if (bestIndex < 50) {
      score += 30;
      console.debug(`📊 Early mention bonus: +30 = ${score}`);
    } else if (bestIndex < 150) {
      score += 20;
      console.debug(`📊 Early mention bonus: +20 = ${score}`);
    } else if (bestIndex < 300) {
      score += 10;
      console.debug(`📊 Early mention bonus: +10 = ${score}`);
    }

    // Bonus for being in first sentence
    const firstSentence = response.split(/[.!?]/)[0];
    if (firstSentence.toLowerCase().includes(bestMatch.toLowerCase())) {
      score += 25;
      console.debug(`📊 First sentence bonus: +25 = ${score}`);
    }

    // Bonus for context quality (mentioned with positive terms)
    const contextWords = ['leading', 'top', 'best', 'premier', 'innovative', 'excellent', 'outstanding', 'renowned', 'established', 'trusted', 'professional', 'expert', 'specialist'];
    const negativeWords = ['small', 'unknown', 'new', 'startup', 'limited', 'basic'];

    let contextBonus = 0;
    for (const word of contextWords) {
      if (responseLower.includes(word) && responseLower.indexOf(word) > bestIndex - 50 && responseLower.indexOf(word) < bestIndex + 50) {
        contextBonus += 5;
      }
    }

    let contextPenalty = 0;
    for (const word of negativeWords) {
      if (responseLower.includes(word) && responseLower.indexOf(word) > bestIndex - 50 && responseLower.indexOf(word) < bestIndex + 50) {
        contextPenalty += 5;
      }
    }

    score += contextBonus - contextPenalty;
    if (contextBonus > 0) console.debug(`📊 Positive context bonus: +${contextBonus} = ${score}`);
    if (contextPenalty > 0) console.debug(`📊 Negative context penalty: -${contextPenalty} = ${score}`);

    // Bonus for being mentioned multiple times
    const regex = new RegExp(businessName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = response.match(regex);
    const mentionCount = matches ? matches.length : 0;
    if (mentionCount > 1) {
      const multiMentionBonus = Math.min(15, mentionCount * 3);
      score += multiMentionBonus;
      console.debug(`📊 Multiple mentions (${mentionCount}x): +${multiMentionBonus} = ${score}`);
    }

    const finalScore = Math.min(100, Math.max(0, score));
    console.debug(`🎯 Final relevance score: ${finalScore}`);
    return finalScore;
  }
}
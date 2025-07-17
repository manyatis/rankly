import { PromptEngine } from './PromptEngine';

export interface QueryResult {
  query: string;
  response: string;
  mentioned: boolean;
  rankPosition: number;
  relevanceScore: number;
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

    // Sort by score (highest first) and return top matches
    return matches
      .filter(m => m.score > 0.3) // Only return matches with decent confidence
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5 matches
  }

  static calculateMatchScore(original: string, match: string): number {
    const originalClean = original.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchClean = match.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Calculate similarity based on character overlap
    let score = 0;
    const maxLength = Math.max(originalClean.length, matchClean.length);

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

    score = matchingChars / maxLength;

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

  static async analyzeWithVariations(
    queryFunction: (query: string) => Promise<string>,
    businessName: string,
    keywords: string[],
    maxQueries: number = 10
  ): Promise<QueryResult[]> {
    console.log(`🚀 Starting AI analysis for "${businessName}" with keywords:`, keywords);

    const keywordQueries = PromptEngine.generateKeywordBasedQueries(businessName, keywords, maxQueries);
    const businessNameVariations = PromptEngine.generateBusinessNameVariations(businessName);
    console.log(`🔍 Business name variations to search for:`, businessNameVariations);

    const results: QueryResult[] = [];

    for (let i = 0; i < keywordQueries.length; i++) {
      const query = keywordQueries[i];
      console.log(`\n📤 Query ${i + 1}/${keywordQueries.length}: "${query}"`);

      try {
        const response = await queryFunction(query);
        console.log(`📥 Response length: ${response.length} characters`);
        console.log(`📄 Response preview: "${response.substring(0, 200)}..."`);

        const responseLower = response.toLowerCase();

        // Check if any variation of the business name appears in the response
        let mentioned = false;
        let bestMatch = '';
        let bestIndex = -1;
        let matchType = 'none';

        console.log(`🔎 Searching for business name variations in response...`);

        // First try exact matches
        for (const nameVariation of businessNameVariations) {
          const nameIndex = responseLower.indexOf(nameVariation.toLowerCase());
          if (nameIndex !== -1) {
            console.log(`✅ EXACT MATCH "${nameVariation}" at position ${nameIndex}`);
            mentioned = true;
            if (bestIndex === -1 || nameIndex < bestIndex) {
              bestIndex = nameIndex;
              bestMatch = nameVariation;
              matchType = 'exact';
            }
          }
        }

        // If no exact match, try fuzzy matching with regex
        if (!mentioned) {
          console.log(`🔍 No exact matches found, trying fuzzy matching...`);
          for (const nameVariation of businessNameVariations) {
            const fuzzyMatches = this.findFuzzyMatches(nameVariation.toLowerCase(), responseLower);
            if (fuzzyMatches.length > 0) {
              const match = fuzzyMatches[0];
              console.log(`🎯 FUZZY MATCH "${match.match}" (score: ${match.score}) at position ${match.index}`);
              mentioned = true;
              if (bestIndex === -1 || match.index < bestIndex) {
                bestIndex = match.index;
                bestMatch = match.match;
                matchType = 'fuzzy';
              }
              break; // Use first fuzzy match found
            }
          }
        }

        if (!mentioned) {
          console.log(`❌ Business name NOT found in this response`);
        } else {
          console.log(`🎯 Best match: "${bestMatch}" at position ${bestIndex}`);
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

          console.log(`📍 Rank position: ${rankPosition} (found at character ${bestIndex})`);

          // Calculate relevance score using extracted method
          relevanceScore = this.calculateRelevanceScore(response, responseLower, bestMatch, bestIndex, businessNameVariations, matchType);
        }

        results.push({
          query,
          response,
          mentioned,
          rankPosition,
          relevanceScore
        });

        console.log(`✅ Query ${i + 1} completed: mentioned=${mentioned}, rank=${rankPosition}, score=${relevanceScore}`);

      } catch (error) {
        console.log(`❌ Query ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
        results.push({
          query,
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          mentioned: false,
          rankPosition: 0,
          relevanceScore: 0
        });
      }
    }

    const mentionCount = results.filter(r => r.mentioned).length;
    console.log(`\n🏁 Analysis complete! Found business in ${mentionCount}/${results.length} queries`);

    return results;
  }

  private static calculateRelevanceScore(response: string, responseLower: string, bestMatch: string, bestIndex: number, businessNameVariations: string[], matchType: string = 'exact'): number {
    let score = 0;

    // Base score for being mentioned (adjust based on match type)
    if (matchType === 'exact') {
      score += 20;
      console.log(`📊 Base score (exact match): +20 = ${score}`);
    } else if (matchType === 'fuzzy') {
      score += 15;
      console.log(`📊 Base score (fuzzy match): +15 = ${score}`);
    }

    // Check for individual word matches to boost compound company names
    const originalWords = businessNameVariations[0].toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (originalWords.length > 1) {
      let individualWordMatches = 0;
      for (const word of originalWords) {
        if (responseLower.includes(word)) {
          individualWordMatches++;
        }
      }
      if (individualWordMatches > 0) {
        const wordMatchBonus = Math.min(10, individualWordMatches * 5);
        score += wordMatchBonus;
        console.log(`📊 Individual word matches (${individualWordMatches}/${originalWords.length}): +${wordMatchBonus} = ${score}`);
      }
    }

    // Bonus for early mention
    if (bestIndex < 50) {
      score += 30;
      console.log(`📊 Early mention bonus: +30 = ${score}`);
    } else if (bestIndex < 150) {
      score += 20;
      console.log(`📊 Early mention bonus: +20 = ${score}`);
    } else if (bestIndex < 300) {
      score += 10;
      console.log(`📊 Early mention bonus: +10 = ${score}`);
    }

    // Bonus for being in first sentence
    const firstSentence = response.split(/[.!?]/)[0];
    if (firstSentence.toLowerCase().includes(bestMatch.toLowerCase())) {
      score += 25;
      console.log(`📊 First sentence bonus: +25 = ${score}`);
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
    if (contextBonus > 0) console.log(`📊 Positive context bonus: +${contextBonus} = ${score}`);
    if (contextPenalty > 0) console.log(`📊 Negative context penalty: -${contextPenalty} = ${score}`);

    // Bonus for being mentioned multiple times
    let mentionCount = 0;
    for (const nameVariation of businessNameVariations) {
      const regex = new RegExp(nameVariation.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = response.match(regex);
      if (matches) mentionCount += matches.length;
    }
    if (mentionCount > 1) {
      const multiMentionBonus = Math.min(15, mentionCount * 3);
      score += multiMentionBonus;
      console.log(`📊 Multiple mentions (${mentionCount}x): +${multiMentionBonus} = ${score}`);
    }

    const finalScore = Math.min(100, Math.max(0, score));
    console.log(`🎯 Final relevance score: ${finalScore}`);
    return finalScore;
  }
}
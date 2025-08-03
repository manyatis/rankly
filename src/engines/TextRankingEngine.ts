export interface BusinessMatch {
  text: string;
  lineNumber: number;
  characterPosition: number;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'partial';
  contextBefore: string;
  contextAfter: string;
  matchedPortion: string;
}

export interface TextRankingResult {
  businessName: string;
  totalMatches: number;
  matches: BusinessMatch[];
  highestConfidenceMatch: BusinessMatch | null;
  averageConfidence: number;
  matchTypes: {
    exact: number;
    fuzzy: number;
    partial: number;
  };
}

export class TextRankingEngine {
  private static readonly GENERIC_WORDS = new Set([
    'the', 'and', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from',
    'bank', 'company', 'corporation', 'inc', 'llc', 'group', 'services', 'systems', 
    'solutions', 'business', 'enterprise', 'enterprises', 'international', 'global',
    'co', 'corp', 'ltd', 'limited', 'usa', 'america', 'united', 'states'
  ]);

  static analyzeBusinessPresence(response: string, businessName: string): TextRankingResult {
    const matches: BusinessMatch[] = [];
    const lines = response.split('\n');
    
    // Find all matches
    this.findExactMatches(response, businessName, lines, matches);
    this.findFuzzyMatches(response, businessName, lines, matches);
    this.findPartialMatches(response, businessName, lines, matches);
    
    // Sort matches by position
    matches.sort((a, b) => a.characterPosition - b.characterPosition);
    
    // Calculate statistics
    const totalMatches = matches.length;
    const averageConfidence = totalMatches > 0 
      ? matches.reduce((sum, match) => sum + match.confidence, 0) / totalMatches 
      : 0;
    
    const highestConfidenceMatch = matches.length > 0 
      ? matches.reduce((highest, current) => 
          current.confidence > highest.confidence ? current : highest
        )
      : null;
    
    const matchTypes = {
      exact: matches.filter(m => m.matchType === 'exact').length,
      fuzzy: matches.filter(m => m.matchType === 'fuzzy').length,
      partial: matches.filter(m => m.matchType === 'partial').length
    };
    
    return {
      businessName,
      totalMatches,
      matches,
      highestConfidenceMatch,
      averageConfidence: Math.round(averageConfidence),
      matchTypes
    };
  }

  private static findExactMatches(
    response: string, 
    businessName: string, 
    lines: string[], 
    matches: BusinessMatch[]
  ): void {
    const regex = new RegExp(this.escapeRegex(businessName), 'gi');
    let match;
    
    while ((match = regex.exec(response)) !== null) {
      const position = match.index;
      const lineInfo = this.getLineInfo(position, lines);
      const context = this.extractContext(response, position, match[0].length);
      
      matches.push({
        text: match[0],
        lineNumber: lineInfo.lineNumber,
        characterPosition: position,
        confidence: 100,
        matchType: 'exact',
        contextBefore: context.before,
        contextAfter: context.after,
        matchedPortion: match[0]
      });
    }
  }

  private static findFuzzyMatches(
    response: string, 
    businessName: string, 
    lines: string[], 
    matches: BusinessMatch[]
  ): void {
    // Already found exact matches, so skip areas where exact matches exist
    const exactPositions = matches.map(m => ({ start: m.characterPosition, end: m.characterPosition + m.text.length }));
    
    // Create variations of the business name
    const variations = this.generateBusinessNameVariations(businessName);
    
    for (const variation of variations) {
      const regex = new RegExp(this.escapeRegex(variation), 'gi');
      let match;
      
      while ((match = regex.exec(response)) !== null) {
        const position = match.index;
        
        // Skip if this overlaps with an exact match
        if (this.overlapsWithExistingMatch(position, match[0].length, exactPositions)) {
          continue;
        }
        
        const confidence = this.calculateFuzzyConfidence(businessName, match[0]);
        if (confidence >= 70) {
          const lineInfo = this.getLineInfo(position, lines);
          const context = this.extractContext(response, position, match[0].length);
          
          matches.push({
            text: match[0],
            lineNumber: lineInfo.lineNumber,
            characterPosition: position,
            confidence,
            matchType: 'fuzzy',
            contextBefore: context.before,
            contextAfter: context.after,
            matchedPortion: match[0]
          });
        }
      }
    }
  }

  private static findPartialMatches(
    response: string, 
    businessName: string, 
    lines: string[], 
    matches: BusinessMatch[]
  ): void {
    const existingPositions = matches.map(m => ({ start: m.characterPosition, end: m.characterPosition + m.text.length }));
    
    // Extract meaningful words from business name
    const businessWords = this.extractMeaningfulWords(businessName);
    
    for (const word of businessWords) {
      if (word.length < 3) continue; // Skip very short words
      
      const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(response)) !== null) {
        const position = match.index;
        
        // Skip if this overlaps with existing matches
        if (this.overlapsWithExistingMatch(position, match[0].length, existingPositions)) {
          continue;
        }
        
        const confidence = this.calculatePartialConfidence(businessName, word, match[0]);
        if (confidence >= 60) {
          const lineInfo = this.getLineInfo(position, lines);
          const context = this.extractContext(response, position, match[0].length);
          
          matches.push({
            text: match[0],
            lineNumber: lineInfo.lineNumber,
            characterPosition: position,
            confidence,
            matchType: 'partial',
            contextBefore: context.before,
            contextAfter: context.after,
            matchedPortion: match[0]
          });
        }
      }
    }
  }

  private static generateBusinessNameVariations(businessName: string): string[] {
    const variations: string[] = [];
    
    // Remove common business suffixes for variations
    const withoutSuffixes = businessName
      .replace(/\s+(Inc|LLC|Corp|Corporation|Company|Co|Ltd|Limited|Group|Services|Systems|Solutions)\.?$/i, '')
      .trim();
    
    if (withoutSuffixes !== businessName) {
      variations.push(withoutSuffixes);
    }
    
    // Add spacing variations
    variations.push(businessName.replace(/\s+/g, ''));
    variations.push(businessName.replace(/\s+/g, '-'));
    variations.push(businessName.replace(/\s+/g, '_'));
    
    // Add common abbreviations
    if (businessName.includes(' ')) {
      const words = businessName.split(' ');
      if (words.length === 2) {
        variations.push(words[0]); // First word only
        variations.push(words[1]); // Second word only
      }
    }
    
    return variations.filter(v => v.length > 2); // Filter out very short variations
  }

  private static extractMeaningfulWords(businessName: string): string[] {
    return businessName
      .toLowerCase()
      .split(/\s+/)
      .filter(word => 
        word.length >= 3 && 
        !this.GENERIC_WORDS.has(word) &&
        !/^[0-9]+$/.test(word) // No pure numbers
      )
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)); // Capitalize first letter
  }

  private static calculateFuzzyConfidence(original: string, match: string): number {
    const similarity = this.calculateStringSimilarity(original.toLowerCase(), match.toLowerCase());
    
    // Boost confidence for exact case-insensitive matches
    if (original.toLowerCase() === match.toLowerCase()) {
      return 95;
    }
    
    // Boost confidence for matches without business suffixes
    const originalWithoutSuffix = original.replace(/\s+(Inc|LLC|Corp|Corporation|Company|Co|Ltd|Limited|Group|Services|Systems|Solutions)\.?$/i, '').trim();
    if (originalWithoutSuffix.toLowerCase() === match.toLowerCase()) {
      return 90;
    }
    
    return Math.max(70, Math.round(similarity * 100));
  }

  private static calculatePartialConfidence(businessName: string, word: string, match: string): number {
    const businessWords = this.extractMeaningfulWords(businessName);
    const totalMeaningfulWords = Math.max(1, businessWords.length);
    
    // Base confidence based on word importance
    let baseConfidence = 60;
    
    // Boost for distinctive words (longer, less common)
    if (word.length >= 6) baseConfidence += 15;
    else if (word.length >= 4) baseConfidence += 10;
    
    // Boost for single-word business names
    if (totalMeaningfulWords === 1) baseConfidence += 20;
    
    // Boost for well-known brand patterns
    if (this.isLikelyBrandName(word)) baseConfidence += 15;
    
    // Examples of high-confidence partial matches:
    // "Chase" from "JPMorgan Chase" should score ~85-90
    // "McDonald's" from "McDonald's Corporation" should score ~90-95
    
    const similarity = this.calculateStringSimilarity(word.toLowerCase(), match.toLowerCase());
    const finalConfidence = Math.round(baseConfidence * similarity);
    
    return Math.min(95, Math.max(60, finalConfidence));
  }

  private static isLikelyBrandName(word: string): boolean {
    // Check for common brand name patterns
    return (
      word.length >= 5 || // Longer words are more distinctive
      /^[A-Z][a-z]*[A-Z]/.test(word) || // CamelCase pattern
      word.includes("'") || // Possessive forms like "McDonald's"
      /^[A-Z]{2,}$/.test(word) // Acronyms like "IBM", "HP"
    );
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  private static getLineInfo(position: number, lines: string[]): { lineNumber: number } {
    let currentPosition = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline character
      if (currentPosition + lineLength > position) {
        return { lineNumber: i + 1 }; // 1-based line numbers
      }
      currentPosition += lineLength;
    }
    
    return { lineNumber: lines.length };
  }

  private static extractContext(response: string, position: number, matchLength: number): { before: string; after: string } {
    const contextLength = 20;
    const beforeStart = Math.max(0, position - contextLength);
    const afterEnd = Math.min(response.length, position + matchLength + contextLength);
    
    const before = response.substring(beforeStart, position);
    const after = response.substring(position + matchLength, afterEnd);
    
    return { before, after };
  }

  private static overlapsWithExistingMatch(
    position: number, 
    length: number, 
    existingMatches: { start: number; end: number }[]
  ): boolean {
    const start = position;
    const end = position + length;
    
    return existingMatches.some(existing => 
      (start >= existing.start && start < existing.end) ||
      (end > existing.start && end <= existing.end) ||
      (start <= existing.start && end >= existing.end)
    );
  }

  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
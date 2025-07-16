export class PromptEngine {
  private static readonly MAX_QUERIES = parseInt(process.env.MAX_AEO_QUERIES || '10');

  static generateKeywordBasedQueries(businessName: string, keywords: string[], maxQueries: number = this.MAX_QUERIES): string[] {
    console.log(`🎯 Generating ${maxQueries} queries for business: "${businessName}" with keywords:`, keywords);

    const variations: string[] = [];
    const keywordCombinations = this.generateKeywordCombinations(keywords);
    console.log(`🔄 Generated ${keywordCombinations.length} keyword combinations:`, keywordCombinations);

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
          `Best ${keywordPhrase} firms and consultants`,
          `Leading ${keywordPhrase} businesses to consider`
        );
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
  }

  static generateBusinessNameVariations(businessName: string): string[] {
    const variations: string[] = [businessName];

    // Basic variations with different spacing
    variations.push(businessName.replace(/\s+/g, ''));
    variations.push(businessName.replace(/\s+/g, '-'));
    variations.push(businessName.replace(/\s+/g, '_'));

    // Add variations with different casing
    variations.push(businessName.toLowerCase());
    variations.push(businessName.toUpperCase());
    variations.push(businessName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '));

    // Remove common business suffixes
    const withoutSuffixes = businessName.replace(/\b(inc|llc|corp|corporation|company|co|ltd|limited|enterprises|group|solutions|services|consulting|partners|associates|international|global|usa|america)\b/gi, '').trim();
    if (withoutSuffixes !== businessName) {
      variations.push(withoutSuffixes);
      variations.push(withoutSuffixes.replace(/\s+/g, ''));
    }

    // Add variations with common abbreviations
    variations.push(businessName.replace(/\band\b/gi, '&'));
    variations.push(businessName.replace(/\b&\b/gi, 'and'));

    // Generate word permutations for multi-word names
    const words = businessName.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    if (words.length > 1) {
      // All possible spacing combinations
      this.generateSpacingPermutations(words).forEach(variation => {
        variations.push(variation);
      });

      // Word order permutations (up to 3 words to avoid explosion)
      if (words.length <= 3) {
        this.generateWordOrderPermutations(words).forEach(permutation => {
          variations.push(permutation.join(' '));
          variations.push(permutation.join(''));
          variations.push(permutation.join('-'));
        });
      }
    }

    return [...new Set(variations)].filter(v => v.length > 1);
  }

  static createSearchPrompt(businessDescription: string): string {
    return `Search the web and find current information as of ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} for: ${businessDescription}

Please provide ONLY a concise list of company names, business names, website names, or people names that are currently active and relevant to this query. Include both established companies and newer market entrants. Do not include descriptions, explanations, or additional information. Format as a simple list with one name per line. Be brief and direct.

Focus on companies that are currently operating and visible in the market today.`;
  }

  private static generateKeywordCombinations(keywords: string[]): string[][] {
    const combinations: string[][] = [];

    // Single keywords
    keywords.forEach(keyword => {
      combinations.push([keyword]);
    });

    // Pairs of keywords
    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        combinations.push([keywords[i], keywords[j]]);
      }
    }

    // Triple combinations if we have enough keywords
    if (keywords.length >= 3) {
      for (let i = 0; i < keywords.length; i++) {
        for (let j = i + 1; j < keywords.length; j++) {
          for (let k = j + 1; k < keywords.length; k++) {
            combinations.push([keywords[i], keywords[j], keywords[k]]);
          }
        }
      }
    }

    // All keywords together if reasonable length
    if (keywords.length <= 5) {
      combinations.push(keywords);
    }

    return combinations;
  }

  private static generateSpacingPermutations(words: string[]): string[] {
    const variations: string[] = [];

    // Generate all possible spacing combinations
    // For "v tee golf" -> "vteegolf", "v teegolf", "vtee golf", etc.
    for (let i = 0; i < Math.pow(2, words.length - 1); i++) {
      let result = words[0];
      for (let j = 1; j < words.length; j++) {
        if (i & Math.pow(2, j - 1)) {
          result += ' ' + words[j];
        } else {
          result += words[j];
        }
      }
      variations.push(result);
    }

    return variations;
  }

  private static generateWordOrderPermutations(words: string[]): string[][] {
    if (words.length <= 1) return [words];

    const permutations: string[][] = [];

    for (let i = 0; i < words.length; i++) {
      const rest = words.slice(0, i).concat(words.slice(i + 1));
      const restPermutations = this.generateWordOrderPermutations(rest);

      for (const perm of restPermutations) {
        permutations.push([words[i], ...perm]);
      }
    }

    return permutations;
  }
}
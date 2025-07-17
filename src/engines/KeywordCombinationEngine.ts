export class KeywordCombinationEngine {
  
  /**
   * Generate different combinations of keywords
   */
  static generateKeywordCombinations(keywords: string[]): string[][] {
    if (keywords.length === 0) {
      return [];
    }

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
    if (keywords.length <= 5 && keywords.length > 1) {
      combinations.push(keywords);
    }

    return combinations;
  }

  /**
   * Generate all possible spacing combinations for words
   */
  static generateSpacingPermutations(words: string[]): string[] {
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

  /**
   * Generate word order permutations
   */
  static generateWordOrderPermutations(words: string[]): string[][] {
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
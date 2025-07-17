import { KeywordCombinationEngine } from './KeywordCombinationEngine';

export class BusinessNameVariationEngine {
  
  /**
   * Generate various business name variations for better search coverage
   */
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
      // Add individual word parts (e.g., "Wells" and "Fargo" from "Wells Fargo")
      words.forEach(word => {
        if (word.length > 2) { // Only add meaningful words
          variations.push(word);
          variations.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
        }
      });

      // All possible spacing combinations
      KeywordCombinationEngine.generateSpacingPermutations(words).forEach(variation => {
        variations.push(variation);
      });

      // Word order permutations (up to 3 words to avoid explosion)
      if (words.length <= 3) {
        KeywordCombinationEngine.generateWordOrderPermutations(words).forEach(permutation => {
          variations.push(permutation.join(' '));
          variations.push(permutation.join(''));
          variations.push(permutation.join('-'));
        });
      }
    }

    return [...new Set(variations)].filter(v => v.length > 1);
  }
}
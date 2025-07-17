import { KeywordCombinationEngine } from '../../src/engines/KeywordCombinationEngine';

describe('KeywordCombinationEngine', () => {
  describe('generateKeywordCombinations', () => {
    it('should generate single keyword combinations', () => {
      const keywords = ['seo', 'marketing'];
      const result = KeywordCombinationEngine.generateKeywordCombinations(keywords);
      
      expect(result).toContainEqual(['seo']);
      expect(result).toContainEqual(['marketing']);
    });

    it('should generate keyword pairs', () => {
      const keywords = ['seo', 'marketing', 'digital'];
      const result = KeywordCombinationEngine.generateKeywordCombinations(keywords);
      
      expect(result).toContainEqual(['seo', 'marketing']);
      expect(result).toContainEqual(['seo', 'digital']);
      expect(result).toContainEqual(['marketing', 'digital']);
    });

    it('should generate triple combinations when enough keywords', () => {
      const keywords = ['seo', 'marketing', 'digital', 'analytics'];
      const result = KeywordCombinationEngine.generateKeywordCombinations(keywords);
      
      expect(result).toContainEqual(['seo', 'marketing', 'digital']);
      expect(result).toContainEqual(['seo', 'marketing', 'analytics']);
      expect(result).toContainEqual(['marketing', 'digital', 'analytics']);
    });

    it('should include all keywords when 2-5 keywords', () => {
      const keywords = ['seo', 'marketing', 'digital'];
      const result = KeywordCombinationEngine.generateKeywordCombinations(keywords);
      
      expect(result).toContainEqual(['seo', 'marketing', 'digital']);
    });

    it('should handle empty keyword array', () => {
      const keywords: string[] = [];
      const result = KeywordCombinationEngine.generateKeywordCombinations(keywords);
      
      expect(result).toEqual([]);
    });

    it('should handle single keyword', () => {
      const keywords = ['seo'];
      const result = KeywordCombinationEngine.generateKeywordCombinations(keywords);
      
      expect(result).toHaveLength(1);
      expect(result).toContainEqual(['seo']);
    });
  });

  describe('generateSpacingPermutations', () => {
    it('should generate all spacing combinations for two words', () => {
      const words = ['hello', 'world'];
      const result = KeywordCombinationEngine.generateSpacingPermutations(words);
      
      expect(result).toContain('hello world');
      expect(result).toContain('helloworld');
      expect(result).toHaveLength(2);
    });

    it('should generate spacing combinations for three words', () => {
      const words = ['hello', 'big', 'world'];
      const result = KeywordCombinationEngine.generateSpacingPermutations(words);
      
      expect(result).toContain('hello big world');
      expect(result).toContain('hellobigworld');
      expect(result).toContain('hello bigworld');
      expect(result).toContain('hellobig world');
      expect(result).toHaveLength(4);
    });

    it('should handle single word', () => {
      const words = ['hello'];
      const result = KeywordCombinationEngine.generateSpacingPermutations(words);
      
      expect(result).toEqual(['hello']);
    });

    it('should handle empty array', () => {
      const words: string[] = [];
      const result = KeywordCombinationEngine.generateSpacingPermutations(words);
      
      expect(result).toHaveLength(1);
    });
  });

  describe('generateWordOrderPermutations', () => {
    it('should generate all permutations for two words', () => {
      const words = ['hello', 'world'];
      const result = KeywordCombinationEngine.generateWordOrderPermutations(words);
      
      expect(result).toContainEqual(['hello', 'world']);
      expect(result).toContainEqual(['world', 'hello']);
      expect(result).toHaveLength(2);
    });

    it('should generate all permutations for three words', () => {
      const words = ['a', 'b', 'c'];
      const result = KeywordCombinationEngine.generateWordOrderPermutations(words);
      
      expect(result).toHaveLength(6); // 3! = 6
      expect(result).toContainEqual(['a', 'b', 'c']);
      expect(result).toContainEqual(['a', 'c', 'b']);
      expect(result).toContainEqual(['b', 'a', 'c']);
      expect(result).toContainEqual(['b', 'c', 'a']);
      expect(result).toContainEqual(['c', 'a', 'b']);
      expect(result).toContainEqual(['c', 'b', 'a']);
    });

    it('should handle single word', () => {
      const words = ['hello'];
      const result = KeywordCombinationEngine.generateWordOrderPermutations(words);
      
      expect(result).toEqual([['hello']]);
    });

    it('should handle empty array', () => {
      const words: string[] = [];
      const result = KeywordCombinationEngine.generateWordOrderPermutations(words);
      
      expect(result).toEqual([[]]);
    });
  });
});
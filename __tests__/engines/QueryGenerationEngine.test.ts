import { QueryGenerationEngine } from '../../src/engines/QueryGenerationEngine';

// Mock the dependencies
jest.mock('../../src/lib/PromptTemplateLoader', () => ({
  PromptTemplateLoader: {
    loadAllQueryVariations: jest.fn(),
  },
}));

jest.mock('../../src/engines/KeywordCombinationEngine', () => ({
  KeywordCombinationEngine: {
    generateKeywordCombinations: jest.fn(),
  },
}));

import { PromptTemplateLoader } from '../../src/lib/PromptTemplateLoader';
import { KeywordCombinationEngine } from '../../src/engines/KeywordCombinationEngine';

describe('QueryGenerationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateKeywordBasedQueries', () => {
    it('should generate queries using template patterns', async () => {
      const mockQueryPatterns = {
        customerStyle2025: ['Top {{keyword}} companies in 2025'],
        conversationalSpecific: ['Can you recommend {{keyword}} services?'],
        comparisonEvaluation: ['Compare {{keyword}} providers'],
        multiKeyword: ['Best {{keywordPhrase}} solutions']
      };

      const mockCombinations = [['seo'], ['marketing'], ['seo', 'marketing']];

      (PromptTemplateLoader.loadAllQueryVariations as jest.Mock).mockResolvedValue(mockQueryPatterns);
      (KeywordCombinationEngine.generateKeywordCombinations as jest.Mock).mockReturnValue(mockCombinations);

      const result = await QueryGenerationEngine.generateKeywordBasedQueries(
        'Test Company',
        ['seo', 'marketing'],
        4
      );

      expect(result).toHaveLength(4);
      expect(result).toContain('Top seo companies in 2025');
      expect(result).toContain('Can you recommend marketing services?');
      expect(PromptTemplateLoader.loadAllQueryVariations).toHaveBeenCalled();
      expect(KeywordCombinationEngine.generateKeywordCombinations).toHaveBeenCalledWith(['seo', 'marketing']);
    });

    it('should handle multi-keyword combinations', async () => {
      const mockQueryPatterns = {
        customerStyle2025: [],
        conversationalSpecific: [],
        comparisonEvaluation: [],
        multiKeyword: ['Best {{keywordPhrase}} solutions']
      };

      const mockCombinations = [['seo'], ['marketing'], ['seo', 'marketing']];

      (PromptTemplateLoader.loadAllQueryVariations as jest.Mock).mockResolvedValue(mockQueryPatterns);
      (KeywordCombinationEngine.generateKeywordCombinations as jest.Mock).mockReturnValue(mockCombinations);

      const result = await QueryGenerationEngine.generateKeywordBasedQueries(
        'Test Company',
        ['seo', 'marketing'],
        2
      );

      expect(result).toContain('Best seo marketing solutions');
    });

    it('should fall back to legacy method on template loading error', async () => {
      (PromptTemplateLoader.loadAllQueryVariations as jest.Mock).mockRejectedValue(new Error('Template error'));
      (KeywordCombinationEngine.generateKeywordCombinations as jest.Mock).mockReturnValue([['seo']]);

      const result = await QueryGenerationEngine.generateKeywordBasedQueries(
        'Test Company',
        ['seo'],
        2
      );

      expect(result).toHaveLength(2);
      expect(console.error).toHaveBeenCalledWith('Failed to load query patterns, falling back to legacy method:', expect.any(Error));
    });

    it('should respect maxQueries parameter', async () => {
      const mockQueryPatterns = {
        customerStyle2025: ['Query 1', 'Query 2', 'Query 3'],
        conversationalSpecific: ['Query 4', 'Query 5', 'Query 6'],
        comparisonEvaluation: ['Query 7', 'Query 8', 'Query 9'],
        multiKeyword: []
      };

      const mockCombinations = [['keyword']];

      (PromptTemplateLoader.loadAllQueryVariations as jest.Mock).mockResolvedValue(mockQueryPatterns);
      (KeywordCombinationEngine.generateKeywordCombinations as jest.Mock).mockReturnValue(mockCombinations);

      const result = await QueryGenerationEngine.generateKeywordBasedQueries(
        'Test Company',
        ['keyword'],
        3
      );

      expect(result).toHaveLength(3);
    });

    it('should handle empty keywords array', async () => {
      const mockQueryPatterns = {
        customerStyle2025: [],
        conversationalSpecific: [],
        comparisonEvaluation: [],
        multiKeyword: []
      };

      (PromptTemplateLoader.loadAllQueryVariations as jest.Mock).mockResolvedValue(mockQueryPatterns);
      (KeywordCombinationEngine.generateKeywordCombinations as jest.Mock).mockReturnValue([]);

      const result = await QueryGenerationEngine.generateKeywordBasedQueries(
        'Test Company',
        [],
        2
      );

      expect(result).toHaveLength(0);
    });

    it('should use default MAX_QUERIES when no maxQueries provided', async () => {
      const mockQueryPatterns = {
        customerStyle2025: ['Query 1'],
        conversationalSpecific: ['Query 2'],
        comparisonEvaluation: ['Query 3'],
        multiKeyword: []
      };

      (PromptTemplateLoader.loadAllQueryVariations as jest.Mock).mockResolvedValue(mockQueryPatterns);
      (KeywordCombinationEngine.generateKeywordCombinations as jest.Mock).mockReturnValue([['test']]);

      const result = await QueryGenerationEngine.generateKeywordBasedQueries(
        'Test Company',
        ['test']
      );

      // Should use default MAX_QUERIES (2)
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe('legacy fallback', () => {
    it('should generate legacy queries when template loading fails', async () => {
      (PromptTemplateLoader.loadAllQueryVariations as jest.Mock).mockRejectedValue(new Error('Failed'));
      (KeywordCombinationEngine.generateKeywordCombinations as jest.Mock).mockReturnValue([['seo'], ['seo', 'marketing']]);

      const result = await QueryGenerationEngine.generateKeywordBasedQueries(
        'Test Company',
        ['seo', 'marketing'],
        4
      );

      expect(result).toHaveLength(4);
      expect(result.some(query => query.includes('2025'))).toBe(true);
      expect(result.some(query => query.includes('seo'))).toBe(true);
    });
  });
});
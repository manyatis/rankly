import { PromptEngineV2 } from '../../src/engines/PromptEngineV2';

// Mock the dependencies
jest.mock('../../src/engines/QueryGenerationEngine', () => ({
  QueryGenerationEngine: {
    generateKeywordBasedQueries: jest.fn(),
  },
}));

jest.mock('../../src/engines/BusinessNameVariationEngine', () => ({
  BusinessNameVariationEngine: {
    generateBusinessNameVariations: jest.fn(),
  },
}));

jest.mock('../../src/engines/SearchPromptEngine', () => ({
  SearchPromptEngine: {
    createSearchPrompt: jest.fn(),
    createSearchPromptSync: jest.fn(),
  },
}));

import { QueryGenerationEngine } from '../../src/engines/QueryGenerationEngine';
import { BusinessNameVariationEngine } from '../../src/engines/BusinessNameVariationEngine';
import { SearchPromptEngine } from '../../src/engines/SearchPromptEngine';

describe('PromptEngineV2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateKeywordBasedQueries', () => {
    it('should delegate to QueryGenerationEngine', async () => {
      const mockQueries = ['Query 1', 'Query 2'];
      (QueryGenerationEngine.generateKeywordBasedQueries as jest.Mock).mockResolvedValue(mockQueries);

      const result = await PromptEngineV2.generateKeywordBasedQueries(
        'Test Business',
        ['keyword1', 'keyword2'],
        5
      );

      expect(QueryGenerationEngine.generateKeywordBasedQueries).toHaveBeenCalledWith(
        'Test Business',
        ['keyword1', 'keyword2'],
        5
      );
      expect(result).toEqual(mockQueries);
    });

    it('should work without maxQueries parameter', async () => {
      const mockQueries = ['Query 1', 'Query 2'];
      (QueryGenerationEngine.generateKeywordBasedQueries as jest.Mock).mockResolvedValue(mockQueries);

      const result = await PromptEngineV2.generateKeywordBasedQueries(
        'Test Business',
        ['keyword1', 'keyword2']
      );

      expect(QueryGenerationEngine.generateKeywordBasedQueries).toHaveBeenCalledWith(
        'Test Business',
        ['keyword1', 'keyword2'],
        undefined
      );
      expect(result).toEqual(mockQueries);
    });
  });

  describe('generateBusinessNameVariations', () => {
    it('should delegate to BusinessNameVariationEngine', () => {
      const mockVariations = ['Business Name', 'BusinessName', 'business-name'];
      (BusinessNameVariationEngine.generateBusinessNameVariations as jest.Mock).mockReturnValue(mockVariations);

      const result = PromptEngineV2.generateBusinessNameVariations('Business Name');

      expect(BusinessNameVariationEngine.generateBusinessNameVariations).toHaveBeenCalledWith('Business Name');
      expect(result).toEqual(mockVariations);
    });
  });

  describe('createSearchPrompt', () => {
    it('should delegate to SearchPromptEngine async method', async () => {
      const mockPrompt = 'Search prompt content';
      (SearchPromptEngine.createSearchPrompt as jest.Mock).mockResolvedValue(mockPrompt);

      const result = await PromptEngineV2.createSearchPrompt('Software development company');

      expect(SearchPromptEngine.createSearchPrompt).toHaveBeenCalledWith('Software development company');
      expect(result).toBe(mockPrompt);
    });
  });

  describe('createSearchPromptSync', () => {
    it('should delegate to SearchPromptEngine sync method', () => {
      const mockPrompt = 'Search prompt content';
      (SearchPromptEngine.createSearchPromptSync as jest.Mock).mockReturnValue(mockPrompt);

      const result = PromptEngineV2.createSearchPromptSync('Software development company');

      expect(SearchPromptEngine.createSearchPromptSync).toHaveBeenCalledWith('Software development company');
      expect(result).toBe(mockPrompt);
    });
  });

  describe('error handling', () => {
    it('should propagate errors from QueryGenerationEngine', async () => {
      const error = new Error('Query generation failed');
      (QueryGenerationEngine.generateKeywordBasedQueries as jest.Mock).mockRejectedValue(error);

      await expect(PromptEngineV2.generateKeywordBasedQueries('Test', ['keyword']))
        .rejects.toThrow('Query generation failed');
    });

    it('should propagate errors from SearchPromptEngine async method', async () => {
      const error = new Error('Search prompt creation failed');
      (SearchPromptEngine.createSearchPrompt as jest.Mock).mockRejectedValue(error);

      await expect(PromptEngineV2.createSearchPrompt('test description'))
        .rejects.toThrow('Search prompt creation failed');
    });

    it('should propagate errors from BusinessNameVariationEngine', () => {
      const error = new Error('Business name variation failed');
      (BusinessNameVariationEngine.generateBusinessNameVariations as jest.Mock).mockImplementation(() => {
        throw error;
      });

      expect(() => PromptEngineV2.generateBusinessNameVariations('Test Business'))
        .toThrow('Business name variation failed');
    });
  });
});
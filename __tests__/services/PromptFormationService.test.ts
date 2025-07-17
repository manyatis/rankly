import { PromptFormationService } from '../../src/services/PromptFormationService';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
    models: {
      list: jest.fn(),
    },
  }));
});

// Mock PromptTemplateLoader
jest.mock('../../src/lib/PromptTemplateLoader', () => ({
  PromptTemplateLoader: {
    loadAEOSystemPrompt: jest.fn(),
    loadGenerateQueriesPrompt: jest.fn(),
    loadFallbackQueries: jest.fn(),
  },
}));

import OpenAI from 'openai';
import { PromptTemplateLoader } from '../../src/lib/PromptTemplateLoader';

describe('PromptFormationService', () => {
  let service: PromptFormationService;
  let mockOpenAI: jest.Mocked<OpenAI>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    service = new PromptFormationService();
    mockOpenAI = (service as any).openai;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateOptimizedPrompts', () => {
    const mockContext = {
      businessName: 'Test Company',
      industry: 'Technology',
      marketDescription: 'B2B software solutions',
      keywords: ['software', 'development', 'consulting']
    };

    it('should generate optimized prompts successfully', async () => {
      const mockSystemPrompt = 'System prompt content';
      const mockUserPrompt = 'User prompt content';
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              queries: ['Query 1', 'Query 2', 'Query 3']
            })
          }
        }]
      };

      (PromptTemplateLoader.loadAEOSystemPrompt as jest.Mock).mockResolvedValue(mockSystemPrompt);
      (PromptTemplateLoader.loadGenerateQueriesPrompt as jest.Mock).mockResolvedValue(mockUserPrompt);
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateOptimizedPrompts(mockContext, 3);

      expect(result).toEqual({
        queries: ['Query 1', 'Query 2', 'Query 3']
      });

      expect(PromptTemplateLoader.loadAEOSystemPrompt).toHaveBeenCalled();
      expect(PromptTemplateLoader.loadGenerateQueriesPrompt).toHaveBeenCalledWith({
        industry: 'Technology',
        marketDescription: 'B2B software solutions',
        keywords: 'software, development, consulting',
        queryCount: '3'
      });
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: mockSystemPrompt },
          { role: 'user', content: mockUserPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
    });

    it('should use fallback queries when too few queries returned', async () => {
      const mockSystemPrompt = 'System prompt content';
      const mockUserPrompt = 'User prompt content';
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              queries: ['Query 1'] // Only 1 query when 3 requested
            })
          }
        }]
      };
      const mockFallbackQueries = ['Fallback 1', 'Fallback 2', 'Fallback 3'];

      (PromptTemplateLoader.loadAEOSystemPrompt as jest.Mock).mockResolvedValue(mockSystemPrompt);
      (PromptTemplateLoader.loadGenerateQueriesPrompt as jest.Mock).mockResolvedValue(mockUserPrompt);
      (PromptTemplateLoader.loadFallbackQueries as jest.Mock).mockResolvedValue(['Fallback {{industry}}', 'Best {{primaryKeyword}}']);
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateOptimizedPrompts(mockContext, 3);

      expect(result.queries).toHaveLength(3);
    });

    it('should handle OpenAI API errors', async () => {
      const mockSystemPrompt = 'System prompt content';
      const mockUserPrompt = 'User prompt content';
      const mockFallbackQueries = ['Fallback 1', 'Fallback 2'];

      (PromptTemplateLoader.loadAEOSystemPrompt as jest.Mock).mockResolvedValue(mockSystemPrompt);
      (PromptTemplateLoader.loadGenerateQueriesPrompt as jest.Mock).mockResolvedValue(mockUserPrompt);
      (PromptTemplateLoader.loadFallbackQueries as jest.Mock).mockResolvedValue(['Fallback {{industry}}', 'Best {{primaryKeyword}}']);
      (mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await service.generateOptimizedPrompts(mockContext, 2);

      expect(result.queries).toHaveLength(2);
      expect(console.error).toHaveBeenCalledWith('Error generating optimized prompts:', expect.any(Error));
    });

    it('should handle template loading errors', async () => {
      (PromptTemplateLoader.loadAEOSystemPrompt as jest.Mock).mockRejectedValue(new Error('Template Error'));

      const result = await service.generateOptimizedPrompts(mockContext, 2);

      expect(result.queries).toEqual([
        'What are the best technology companies?',
        'Top technology solutions for businesses'
      ]);
      expect(console.error).toHaveBeenCalledWith('Error loading prompt templates:', expect.any(Error));
    });

    it('should handle invalid OpenAI response', async () => {
      const mockSystemPrompt = 'System prompt content';
      const mockUserPrompt = 'User prompt content';
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      (PromptTemplateLoader.loadAEOSystemPrompt as jest.Mock).mockResolvedValue(mockSystemPrompt);
      (PromptTemplateLoader.loadGenerateQueriesPrompt as jest.Mock).mockResolvedValue(mockUserPrompt);
      (PromptTemplateLoader.loadFallbackQueries as jest.Mock).mockResolvedValue(['Fallback {{industry}}']);
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateOptimizedPrompts(mockContext, 2);

      expect(result.queries).toHaveLength(2);
    });

    it('should handle empty OpenAI response', async () => {
      const mockSystemPrompt = 'System prompt content';
      const mockUserPrompt = 'User prompt content';
      const mockResponse = {
        choices: [{
          message: {
            content: null
          }
        }]
      };

      (PromptTemplateLoader.loadAEOSystemPrompt as jest.Mock).mockResolvedValue(mockSystemPrompt);
      (PromptTemplateLoader.loadGenerateQueriesPrompt as jest.Mock).mockResolvedValue(mockUserPrompt);
      (PromptTemplateLoader.loadFallbackQueries as jest.Mock).mockResolvedValue(['Fallback {{industry}}']);
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateOptimizedPrompts(mockContext, 2);

      expect(result.queries).toHaveLength(2);
    });
  });

  describe('validateApiKey', () => {
    it('should return true for valid API key', async () => {
      (mockOpenAI.models.list as jest.Mock).mockResolvedValue({});

      const result = await service.validateApiKey();

      expect(result).toBe(true);
      expect(mockOpenAI.models.list).toHaveBeenCalled();
    });

    it('should return false for invalid API key', async () => {
      (mockOpenAI.models.list as jest.Mock).mockRejectedValue(new Error('Invalid API key'));

      const result = await service.validateApiKey();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('OpenAI API key validation failed:', expect.any(Error));
    });
  });
});
import { PromptTemplateLoader } from '../../src/lib/PromptTemplateLoader';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Mock fs/promises
const mockReadFile = jest.fn();
jest.mock('fs/promises', () => ({
  readFile: mockReadFile,
}));

describe('PromptTemplateLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadTextPrompt', () => {
    it('should load and process text prompt with variables', async () => {
      const mockContent = 'Hello {{name}}, welcome to {{company}}!';
      mockReadFile.mockResolvedValue(mockContent);

      const result = await PromptTemplateLoader.loadTextPrompt('system', 'test.txt', {
        name: 'John',
        company: 'Acme Corp'
      });

      expect(result).toBe('Hello John, welcome to Acme Corp!');
      expect(mockReadFile).toHaveBeenCalledWith(
        expect.stringContaining('src/prompts/system/test.txt'),
        'utf-8'
      );
    });

    it('should load text prompt without variables', async () => {
      const mockContent = 'This is a simple prompt.';
      mockReadFile.mockResolvedValue(mockContent);

      const result = await PromptTemplateLoader.loadTextPrompt('user', 'simple.txt');

      expect(result).toBe('This is a simple prompt.');
    });

    it('should handle multiple instances of same variable', async () => {
      const mockContent = '{{keyword}} is important. Use {{keyword}} effectively.';
      mockReadFile.mockResolvedValue(mockContent);

      const result = await PromptTemplateLoader.loadTextPrompt('test', 'multi.txt', {
        keyword: 'SEO'
      });

      expect(result).toBe('SEO is important. Use SEO effectively.');
    });

    it('should handle file read errors', async () => {
      const error = new Error('File not found');
      mockReadFile.mockRejectedValue(error);

      await expect(PromptTemplateLoader.loadTextPrompt('test', 'missing.txt'))
        .rejects.toThrow('Failed to load prompt template');
    });
  });

  describe('loadQueryVariations', () => {
    it('should load and parse query variations JSON', async () => {
      const mockContent = JSON.stringify({
        patterns: ['Pattern 1', 'Pattern 2', 'Pattern 3']
      });
      mockReadFile.mockResolvedValue(mockContent);

      const result = await PromptTemplateLoader.loadQueryVariations('test.json');

      expect(result).toEqual(['Pattern 1', 'Pattern 2', 'Pattern 3']);
      expect(mockReadFile).toHaveBeenCalledWith(
        expect.stringContaining('src/prompts/query-variations/test.json'),
        'utf-8'
      );
    });

    it('should handle invalid JSON', async () => {
      const mockContent = 'invalid json';
      mockReadFile.mockResolvedValue(mockContent);

      await expect(PromptTemplateLoader.loadQueryVariations('invalid.json'))
        .rejects.toThrow('Failed to load query variations');
    });
  });

  describe('loadAEOSystemPrompt', () => {
    it('should load AEO system prompt', async () => {
      const mockContent = 'AEO system prompt content';
      mockReadFile.mockResolvedValue(mockContent);

      const result = await PromptTemplateLoader.loadAEOSystemPrompt();

      expect(result).toBe('AEO system prompt content');
      expect(mockReadFile).toHaveBeenCalledWith(
        expect.stringContaining('src/prompts/system/aeo-optimization.txt'),
        'utf-8'
      );
    });
  });

  describe('loadGenerateQueriesPrompt', () => {
    it('should load and process generate queries prompt', async () => {
      const mockContent = 'Industry: {{industry}}, Keywords: {{keywords}}, Count: {{queryCount}}';
      mockReadFile.mockResolvedValue(mockContent);

      const variables = {
        industry: 'Technology',
        marketDescription: 'B2B software',
        keywords: 'AI, ML, SaaS',
        queryCount: '5'
      };

      const result = await PromptTemplateLoader.loadGenerateQueriesPrompt(variables);

      expect(result).toContain('Industry: Technology');
      expect(result).toContain('Keywords: AI, ML, SaaS');
      expect(result).toContain('Count: 5');
    });
  });

  describe('loadWebSearchPrompt', () => {
    it('should load and process web search prompt', async () => {
      const mockContent = 'Search as of {{currentDate}} for: {{businessDescription}}';
      mockReadFile.mockResolvedValue(mockContent);

      const variables = {
        currentDate: 'January 1, 2024',
        businessDescription: 'Tech startup'
      };

      const result = await PromptTemplateLoader.loadWebSearchPrompt(variables);

      expect(result).toBe('Search as of January 1, 2024 for: Tech startup');
    });
  });

  describe('loadFallbackQueries', () => {
    it('should load fallback queries', async () => {
      const mockContent = JSON.stringify({
        patterns: ['Fallback 1', 'Fallback 2']
      });
      mockReadFile.mockResolvedValue(mockContent);

      const result = await PromptTemplateLoader.loadFallbackQueries();

      expect(result).toEqual(['Fallback 1', 'Fallback 2']);
    });
  });

  describe('loadAllQueryVariations', () => {
    it('should load all query variation types', async () => {
      const mockQueries = {
        'customer-style-2025.json': { patterns: ['Customer 1', 'Customer 2'] },
        'conversational-specific.json': { patterns: ['Conv 1', 'Conv 2'] },
        'comparison-evaluation.json': { patterns: ['Comp 1', 'Comp 2'] },
        'multi-keyword.json': { patterns: ['Multi 1', 'Multi 2'] }
      };

      mockReadFile.mockImplementation((path: any) => {
        const filename = path.split('/').pop();
        return Promise.resolve(JSON.stringify(mockQueries[filename as keyof typeof mockQueries]));
      });

      const result = await PromptTemplateLoader.loadAllQueryVariations();

      expect(result).toEqual({
        customerStyle2025: ['Customer 1', 'Customer 2'],
        conversationalSpecific: ['Conv 1', 'Conv 2'],
        comparisonEvaluation: ['Comp 1', 'Comp 2'],
        multiKeyword: ['Multi 1', 'Multi 2']
      });

      expect(mockReadFile).toHaveBeenCalledTimes(4);
    });

    it('should handle errors when loading query variations', async () => {
      mockReadFile.mockRejectedValue(new Error('File not found'));

      await expect(PromptTemplateLoader.loadAllQueryVariations())
        .rejects.toThrow('Failed to load query variations');
    });
  });
});
import { SearchPromptEngine } from '../../src/engines/SearchPromptEngine';

// Mock the PromptTemplateLoader
jest.mock('../../src/lib/PromptTemplateLoader', () => ({
  PromptTemplateLoader: {
    loadWebSearchPrompt: jest.fn(),
  },
}));

import { PromptTemplateLoader } from '../../src/lib/PromptTemplateLoader';

describe('SearchPromptEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSearchPrompt', () => {
    it('should create search prompt using template loader', async () => {
      const mockPrompt = 'Mock search prompt with business description';
      (PromptTemplateLoader.loadWebSearchPrompt as jest.Mock).mockResolvedValue(mockPrompt);

      const businessDescription = 'Software development company';
      const result = await SearchPromptEngine.createSearchPrompt(businessDescription);

      expect(PromptTemplateLoader.loadWebSearchPrompt).toHaveBeenCalledWith({
        currentDate: expect.any(String),
        businessDescription,
      });
      expect(result).toBe(mockPrompt);
    });

    it('should handle template loader errors', async () => {
      const error = new Error('Template loading failed');
      (PromptTemplateLoader.loadWebSearchPrompt as jest.Mock).mockRejectedValue(error);

      const businessDescription = 'Software development company';
      
      await expect(SearchPromptEngine.createSearchPrompt(businessDescription)).rejects.toThrow('Template loading failed');
    });
  });

  describe('createSearchPromptSync', () => {
    it('should create search prompt synchronously', () => {
      const businessDescription = 'Software development company';
      const result = SearchPromptEngine.createSearchPromptSync(businessDescription);

      expect(result).toContain('Search the web and find current information');
      expect(result).toContain(businessDescription);
      expect(result).toContain('Please provide ONLY a concise list');
    });

    it('should include current date in prompt', () => {
      const businessDescription = 'Test company';
      const result = SearchPromptEngine.createSearchPromptSync(businessDescription);

      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      expect(result).toContain(currentDate);
    });

    it('should handle empty business description', () => {
      const businessDescription = '';
      const result = SearchPromptEngine.createSearchPromptSync(businessDescription);

      expect(result).toContain('Search the web and find current information');
      expect(result).toContain(businessDescription); // Empty string should still work
    });

    it('should include all expected prompt sections', () => {
      const businessDescription = 'Tech startup';
      const result = SearchPromptEngine.createSearchPromptSync(businessDescription);

      expect(result).toContain('Search the web and find current information');
      expect(result).toContain('Please provide ONLY a concise list');
      expect(result).toContain('Include both established companies and newer market entrants');
      expect(result).toContain('Format as a simple list with one name per line');
      expect(result).toContain('Focus on companies that are currently operating');
    });
  });
});
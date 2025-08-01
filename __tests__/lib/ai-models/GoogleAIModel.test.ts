import { GoogleAIModel } from '../../../src/lib/ai-models/GoogleAIModel';

describe('GoogleAIModel', () => {
  let model: GoogleAIModel;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    model = new GoogleAIModel();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getName', () => {
    it('should return "Google"', () => {
      expect(model.getName()).toBe('Google');
    });
  });

  describe('getRequiredEnvVars', () => {
    it('should return GOOGLE_AI_API_KEY', () => {
      expect(model.getRequiredEnvVars()).toEqual(['GOOGLE_AI_API_KEY']);
    });
  });

  describe('isConfigured', () => {
    it('should return true when GOOGLE_AI_API_KEY is set', () => {
      process.env.GOOGLE_AI_API_KEY = 'test-api-key';
      expect(model.isConfigured()).toBe(true);
    });

    it('should return false when GOOGLE_AI_API_KEY is not set', () => {
      delete process.env.GOOGLE_AI_API_KEY;
      expect(model.isConfigured()).toBe(false);
    });
  });

  describe('query', () => {
    it('should return error message when not configured', async () => {
      delete process.env.GOOGLE_AI_API_KEY;
      const result = await model.query('test prompt');
      expect(result).toContain('Error: Missing environment variables: GOOGLE_AI_API_KEY');
    });

    it('should handle API errors gracefully', async () => {
      process.env.GOOGLE_AI_API_KEY = 'test-api-key';
      // The actual API call will fail with invalid key, which is expected
      const result = await model.query('test prompt');
      expect(result).toContain('Error querying Google:');
    });
  });
});
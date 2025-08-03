import { BaseAIModel } from './BaseAIModel';
import { OpenAIModel } from './OpenAIModel';
import { AnthropicModel } from './AnthropicModel';
import { PerplexityModel } from './PerplexityModel';
import { GoogleAIModel } from './GoogleAIModel';
import { isFeatureEnabled } from '../feature-flags';

export type ModelType = 'openai' | 'anthropic' | 'perplexity' | 'google';

export interface ModelInfo {
  type: ModelType;
  name: string;
  displayName: string;
  isConfigured: boolean;
  requiredEnvVars: string[];
}

export class ModelFactory {
  private static models = new Map<ModelType, () => BaseAIModel>([
    ['openai', () => new OpenAIModel()],
    ['anthropic', () => new AnthropicModel()],
    ['perplexity', () => new PerplexityModel()],
    ['google', () => new GoogleAIModel()]
  ]);

  static createModel(type: ModelType): BaseAIModel {
    const modelCreator = this.models.get(type);
    if (!modelCreator) {
      throw new Error(`Unsupported model type: ${type}`);
    }
    return modelCreator();
  }

  static getAvailableModels(): ModelInfo[] {
    return Array.from(this.models.keys())
      .filter(type => {
        // Filter out Google model if feature flag is disabled
        if (type === 'google' && !isFeatureEnabled('googleAI')) {
          return false;
        }
        return true;
      })
      .map(type => {
        const model = this.createModel(type);
        return {
          type,
          name: model.getName(),
          displayName: model.getName(),
          isConfigured: model.isConfigured(),
          requiredEnvVars: model.getRequiredEnvVars()
        };
      });
  }

  static getConfiguredModels(): ModelInfo[] {
    return this.getAvailableModels().filter(model => model.isConfigured);
  }

  static isModelSupported(type: string): boolean {
    return this.models.has(type as ModelType);
  }

  static async queryModel(type: ModelType, prompt: string): Promise<string> {
    const startTime = Date.now();
    const phase = this.determinePhase();
    const truncatedPrompt = prompt.substring(0, 150).replace(/\n/g, ' ');
    
    console.log(`🤖 ${phase} - API_CALL - ${type.toUpperCase()} - Query: "${truncatedPrompt}${prompt.length > 150 ? '...' : ''}"`);
    
    try {
      const model = this.createModel(type);
      const result = await model.query(prompt);
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${phase} - API_RESPONSE - ${type.toUpperCase()} - Success (${duration}ms, ${result.length} chars)`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${phase} - API_ERROR - ${type.toUpperCase()} - Failed (${duration}ms):`, error instanceof Error ? error.message : error);
      throw error;
    }
  }

  private static determinePhase(): string {
    const stack = new Error().stack || '';
    
    // Check for specific service patterns in call stack
    if (stack.includes('PromptFormationService')) return 'PROMPT_GEN';
    if (stack.includes('WebsiteAnalysisService')) return 'WEBSITE_ANALYSIS';
    if (stack.includes('CompetitorService')) return 'COMPETITOR_ID';
    if (stack.includes('AIInsightsService')) return 'AI_INSIGHTS';
    if (stack.includes('WordPositionAnalysisService')) return 'WORD_ANALYSIS';
    if (stack.includes('WebsiteInfoExtractionService')) return 'WEBSITE_EXTRACT';
    if (stack.includes('StagedAnalysisService')) return 'STAGED_ANALYSIS';
    if (stack.includes('AEOAnalysisService')) return 'AEO_ANALYSIS';
    if (stack.includes('blog/generate')) return 'BLOG_GEN';
    if (stack.includes('generate-prompts')) return 'API_PROMPT_GEN';
    if (stack.includes('AnalyticalEngine')) return 'ANALYTICAL_ENGINE';
    
    return 'UNKNOWN_PHASE';
  }

  static getSupportedModelTypes(): ModelType[] {
    return Array.from(this.models.keys());
  }
}
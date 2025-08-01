import { BaseAIModel } from './BaseAIModel';
import { OpenAIModel } from './OpenAIModel';
import { AnthropicModel } from './AnthropicModel';
import { PerplexityModel } from './PerplexityModel';
import { GoogleAIModel } from './GoogleAIModel';

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
    return Array.from(this.models.keys()).map(type => {
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
    const model = this.createModel(type);
    return await model.query(prompt);
  }

  static getSupportedModelTypes(): ModelType[] {
    return Array.from(this.models.keys());
  }
}
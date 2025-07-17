import { ModelFactory, type ModelType } from '../lib/ai-models';
import { AnalyticalEngine, QueryResult } from '../engines/AnalyticalEngine';
import { RankingEngine, ScoringFactors, CompetitorInfo } from '../engines/RankingEngine';
import { getUser, checkUsageLimit, incrementUsage } from '../lib/auth';

export interface AIProvider {
  name: string;
  model: string;
  color: string;
  type?: ModelType;
}

export interface ProviderScoringResult {
  provider: AIProvider;
  response: string;
  aeoScore: number;
  factors: ScoringFactors;
  analysis: string;
  queryVariations: QueryResult[];
  overallVisibility: number;
  competitorAnalysis: CompetitorInfo[];
  missedResponses: QueryResult[];
}

export interface AnalysisRequest {
  businessName: string;
  keywords: string[];
  providers: AIProvider[];
}

export interface AnalysisResult {
  results: ProviderScoringResult[];
  overallCompetitorAnalysis: CompetitorInfo[];
  usageInfo?: {
    usageCount: number;
    maxUsage: number | string;
    canUse: boolean;
    tier: string;
  };
}

export interface AuthValidationResult {
  isValid: boolean;
  user?: { email: string; id?: string; name?: string | null; image?: string | null };
  usageInfo?: {
    usageCount: number;
    maxUsage: number | string;
    canUse: boolean;
    tier: string;
  };
  error?: string;
  statusCode?: number;
}

export class AEOAnalysisService {
  private static readonly MAX_QUERIES = parseInt(process.env.MAX_AEO_QUERIES || '5');

  private static getModelTypeFromProvider(provider: AIProvider): ModelType {
    const providerNameToType: Record<string, ModelType> = {
      'OpenAI': 'openai',
      'Claude': 'anthropic',
      'Perplexity': 'perplexity'
    };

    if (provider.type && ModelFactory.isModelSupported(provider.type)) {
      return provider.type;
    }

    const modelType = providerNameToType[provider.name];
    if (modelType && ModelFactory.isModelSupported(modelType)) {
      return modelType;
    }

    return 'openai';
  }

  private static async queryAIModel(provider: AIProvider, businessDescription: string): Promise<string> {
    const modelType = this.getModelTypeFromProvider(provider);
    return await ModelFactory.queryModel(modelType, businessDescription);
  }

  static async validateAuthAndUsage(): Promise<AuthValidationResult> {
    console.log(`🔐 Validating authentication and usage limits`);

    const user = await getUser();
    if (!user?.email) {
      console.log(`❌ User not authenticated`);
      return {
        isValid: false,
        error: 'Authentication required',
        statusCode: 401
      };
    }

    const usageInfo = await checkUsageLimit(user.email);
    if (!usageInfo.canUse) {
      console.log(`❌ Usage limit exceeded for ${user.email}: ${usageInfo.usageCount}/${usageInfo.maxUsage}`);
      return {
        isValid: false,
        error: `Daily limit reached. You've used ${usageInfo.usageCount}/${usageInfo.maxUsage} free analytics today.`,
        statusCode: 429,
        usageInfo
      };
    }

    console.log(`✅ Authentication and usage validation passed for ${user.email} (${usageInfo.usageCount}/${usageInfo.maxUsage} used)`);
    return {
      isValid: true,
      user: { email: user.email!, id: user.id, name: user.name, image: user.image },
      usageInfo
    };
  }

  static validateRequest(request: AnalysisRequest): { isValid: boolean; error?: string } {
    const { businessName, keywords, providers } = request;

    if (!businessName || !keywords || !providers) {
      console.log(`❌ Missing required fields`);
      return {
        isValid: false,
        error: 'Missing required fields: businessName, keywords, and providers'
      };
    }

    return { isValid: true };
  }

  static async incrementUserUsage(userEmail: string): Promise<{ success: boolean; error?: string }> {
    const usageIncremented = await incrementUsage(userEmail);
    if (!usageIncremented) {
      console.log(`❌ Failed to increment usage or limit exceeded`);
      return {
        success: false,
        error: 'Usage limit exceeded'
      };
    }
    console.log(`✅ Usage incremented for ${userEmail}`);
    return { success: true };
  }

  static async analyzeProviders(request: AnalysisRequest): Promise<ProviderScoringResult[]> {
    const { businessName, keywords, providers } = request;
    const results: ProviderScoringResult[] = [];

    console.log(`🏢 Business Name: "${businessName}"`);
    console.log(`🔑 Keywords:`, keywords);
    console.log(`🤖 Providers:`, providers.map((p: AIProvider) => p.name));

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      console.log(`\n🔄 Processing provider ${i + 1}/${providers.length}: ${provider.name}`);
      
      const queryFunction = (businessDescription: string) => this.queryAIModel(provider, businessDescription);
      const queryResults = await AnalyticalEngine.analyzeWithVariations(queryFunction, businessName, keywords, this.MAX_QUERIES);
      const scoring = RankingEngine.calculateEnhancedAEOScore(queryResults, businessName, keywords);
      const mainResponse = queryResults.length > 0 ? queryResults[0].response : 'No response generated';

      results.push({
        provider,
        response: mainResponse,
        aeoScore: scoring.aeoScore,
        factors: scoring.factors,
        analysis: scoring.analysis,
        queryVariations: queryResults,
        overallVisibility: scoring.overallVisibility,
        competitorAnalysis: scoring.competitorAnalysis,
        missedResponses: scoring.missedResponses
      });

      console.log(`✅ ${provider.name} analysis complete. Score: ${scoring.aeoScore}/100`);
    }

    console.log(`\n🏁 === ANALYSIS COMPLETE ===`);
    console.log(`📊 Results summary:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.provider.name}: ${result.aeoScore}/100 (${result.overallVisibility}% visibility)`);
    });

    return results;
  }

  static aggregateCompetitors(results: ProviderScoringResult[], businessName: string): CompetitorInfo[] {
    console.log(`\n🏢 Aggregating competitors across all models`);
    
    const competitorMentions = new Map<string, { mentions: number, totalQueries: number, providers: Set<string> }>();
    
    // Collect all competitors from all providers
    results.forEach(result => {
      console.log(`📊 Processing competitors from ${result.provider.name}: ${result.competitorAnalysis.length} found`);
      
      result.competitorAnalysis.forEach(competitor => {
        const existing = competitorMentions.get(competitor.name) || { 
          mentions: 0, 
          totalQueries: 0, 
          providers: new Set<string>() 
        };
        
        existing.mentions += competitor.mentions;
        existing.totalQueries += result.queryVariations.filter(q => !q.response.startsWith('Error')).length;
        existing.providers.add(result.provider.name);
        
        competitorMentions.set(competitor.name, existing);
      });
    });

    // Calculate aggregated scores and filter
    const aggregatedCompetitors = Array.from(competitorMentions.entries())
      .map(([name, data]) => ({
        name,
        mentions: data.mentions,
        score: Math.round((data.mentions / data.totalQueries) * 100),
        providers: Array.from(data.providers),
        providerCount: data.providers.size
      }))
      .filter(competitor => competitor.mentions >= 2) // Only include competitors mentioned at least twice
      .sort((a, b) => {
        // Sort by provider count first (more providers = more credible), then by mentions
        if (b.providerCount !== a.providerCount) {
          return b.providerCount - a.providerCount;
        }
        return b.mentions - a.mentions;
      })
      .slice(0, 15) // Top 15 competitors
      .map(({ providers, providerCount, ...competitor }) => competitor); // Remove helper fields

    console.log(`✅ Aggregated competitors: ${aggregatedCompetitors.length} unique competitors found`);
    aggregatedCompetitors.forEach((competitor, index) => {
      console.log(`   ${index + 1}. ${competitor.name}: ${competitor.mentions} mentions (${competitor.score}%)`);
    });

    return aggregatedCompetitors;
  }

  static async runAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    console.log(`\n🚀 === NEW AEO ANALYSIS REQUEST ===`);

    // Validate authentication and usage
    const authResult = await this.validateAuthAndUsage();
    if (!authResult.isValid) {
      throw new Error(authResult.error || 'Authentication failed');
    }

    // Validate request
    const requestValidation = this.validateRequest(request);
    if (!requestValidation.isValid) {
      throw new Error(requestValidation.error || 'Invalid request');
    }

    // Increment usage
    const usageResult = await this.incrementUserUsage(authResult.user!.email);
    if (!usageResult.success) {
      throw new Error(usageResult.error || 'Usage limit exceeded');
    }

    // Run analysis
    const results = await this.analyzeProviders(request);

    // Aggregate competitors from all models
    const overallCompetitorAnalysis = this.aggregateCompetitors(results, request.businessName);

    return {
      results,
      overallCompetitorAnalysis,
      usageInfo: authResult.usageInfo
    };
  }
}
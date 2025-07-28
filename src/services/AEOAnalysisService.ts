import { ModelFactory, type ModelType } from '../lib/ai-models';
import { AnalyticalEngine, QueryResult } from '../engines/AnalyticalEngine';
import { RankingEngine, ScoringFactors, CompetitorInfo } from '../engines/RankingEngine';
import { getUser, checkUsageLimit, incrementUsage } from '../lib/auth';
import { PromptFormationService } from './PromptFormationService';
import { WebsiteAnalysisService, type WebsiteAnalysisResult } from './WebsiteAnalysisService';
import { PrismaClient } from '../generated/prisma';
import { randomUUID } from 'crypto';

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
  industry: string;
  location?: string;
  websiteUrl?: string;
  marketDescription: string;
  keywords: string[];
  providers: AIProvider[];
  customPrompts?: string[];
}

export interface AnalysisResult {
  results: ProviderScoringResult[];
  overallCompetitorAnalysis: CompetitorInfo[];
  websiteAnalysis?: WebsiteAnalysisResult;
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
  private static readonly prisma = new PrismaClient();

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

  private static async queryAIModel(provider: AIProvider, prompt: string): Promise<string> {
    const modelType = this.getModelTypeFromProvider(provider);
    return await ModelFactory.queryModel(modelType, prompt);
  }

  static async validateAuthAndUsage(): Promise<AuthValidationResult> {
    console.debug(`🔐 Validating authentication and usage limits`);

    const user = await getUser();
    if (!user?.email) {
      console.debug(`❌ User not authenticated`);
      return {
        isValid: false,
        error: 'Authentication required',
        statusCode: 401
      };
    }

    const usageInfo = await checkUsageLimit(user.email);
    if (!usageInfo.canUse) {
      console.debug(`❌ Usage limit exceeded for ${user.email}: ${usageInfo.usageCount}/${usageInfo.maxUsage}`);
      return {
        isValid: false,
        error: `Daily limit reached. You've used ${usageInfo.usageCount}/${usageInfo.maxUsage} free analytics today.`,
        statusCode: 429,
        usageInfo
      };
    }

    console.debug(`✅ Authentication and usage validation passed for ${user.email} (${usageInfo.usageCount}/${usageInfo.maxUsage} used)`);
    return {
      isValid: true,
      user: { email: user.email!, id: user.id, name: user.name, image: user.image },
      usageInfo
    };
  }

  static validateRequest(request: AnalysisRequest): { isValid: boolean; error?: string } {
    const { businessName, industry, marketDescription, keywords, providers, websiteUrl } = request;

    const missingFields = [];
    if (!businessName) missingFields.push('businessName');
    if (!industry) missingFields.push('industry');
    if (!marketDescription) missingFields.push('marketDescription');
    if (!keywords) missingFields.push('keywords');
    else if (!Array.isArray(keywords)) missingFields.push('keywords (must be array)');
    else if (keywords.length === 0) missingFields.push('keywords (must be non-empty)');
    if (!providers) missingFields.push('providers');
    else if (!Array.isArray(providers)) missingFields.push('providers (must be array)');
    else if (providers.length === 0) missingFields.push('providers (must be non-empty)');

    // Validate and normalize websiteUrl if provided
    if (websiteUrl) {
      // Add https:// if no protocol is present
      let normalizedUrl = websiteUrl.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      
      if (!this.isValidUrl(normalizedUrl)) {
        return {
          isValid: false,
          error: 'Invalid website URL format'
        };
      }
      
      // Update the request with the normalized URL
      request.websiteUrl = normalizedUrl;
    }

    if (missingFields.length > 0) {
      console.info(`❌ Missing required fields: ${missingFields.join(', ')}`);
      return {
        isValid: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    return { isValid: true };
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static async incrementUserUsage(userEmail: string): Promise<{ success: boolean; error?: string }> {
    const usageIncremented = await incrementUsage(userEmail);
    if (!usageIncremented) {
      console.debug(`❌ Failed to increment usage or limit exceeded`);
      return {
        success: false,
        error: 'Usage limit exceeded'
      };
    }
    console.debug(`✅ Usage incremented for ${userEmail}`);
    return { success: true };
  }

  static async analyzeProviders(request: AnalysisRequest): Promise<ProviderScoringResult[]> {
    const { businessName, industry, location, marketDescription, keywords, providers, customPrompts } = request;

    console.debug(`🏢 Business Name: "${businessName}"`);
    console.debug(`🏭 Industry: "${industry}"`);
    if (location) console.debug(`📍 Location: "${location}"`);
    console.debug(`📄 Market Description: "${marketDescription}"`);
    console.debug(`🔑 Keywords:`, keywords);
    console.debug(`🤖 Providers:`, providers.map((p: AIProvider) => p.name));

    let optimizedQueries: string[];

    if (customPrompts && customPrompts.length > 0) {
      // Use custom prompts provided by the user
      optimizedQueries = customPrompts.filter(prompt => prompt.trim().length > 0);
      console.debug(`\n📝 Using ${optimizedQueries.length} custom prompts provided by user`);
    } else {
      // Generate optimized prompts using OpenAI
      console.debug(`\n🧠 Generating optimized prompts using OpenAI...`);
      const promptFormationService = new PromptFormationService();
      
      try {
        const promptResult = await promptFormationService.generateOptimizedPrompts({
          businessName,
          industry,
          location,
          marketDescription,
          keywords
        }, 3); // Generate 3 queries to match UI
        optimizedQueries = promptResult.queries;
        console.debug(`✅ Generated ${optimizedQueries.length} optimized queries`);
      } catch (error) {
        console.warn(`⚠️ Failed to generate optimized prompts, using fallback:`, error);
        // Fallback to default query generation (3 queries to match)
        optimizedQueries = [
          `What are the best ${industry.toLowerCase()} companies?`,
          `Top ${industry.toLowerCase()} solutions for businesses`,
          `How to choose a reliable ${industry.toLowerCase()} provider?`
        ];
      }
    }

    console.debug(`\n🚀 Starting parallel analysis of ${providers.length} providers with optimized queries...`);

    // Create analysis promises for all providers to run in parallel
    const analysisPromises = providers.map(async (provider, index) => {
      console.debug(`🔄 Starting analysis for provider ${index + 1}/${providers.length}: ${provider.name}`);

      try {
        const queryFunction = (prompt: string) => this.queryAIModel(provider, prompt);
        const queryResults = await AnalyticalEngine.analyzeWithCustomQueries(queryFunction, businessName, optimizedQueries);
        const scoring = RankingEngine.calculateEnhancedAEOScore(queryResults, businessName);
        const mainResponse = queryResults.length > 0 ? queryResults[0].response : 'No response generated';

        const result: ProviderScoringResult = {
          provider,
          response: mainResponse,
          aeoScore: scoring.aeoScore,
          factors: scoring.factors,
          analysis: scoring.analysis,
          queryVariations: queryResults,
          overallVisibility: scoring.overallVisibility,
          competitorAnalysis: scoring.competitorAnalysis,
          missedResponses: scoring.missedResponses
        };

        console.debug(`✅ ${provider.name} analysis complete. Score: ${scoring.aeoScore}/100`);
        return result;
      } catch (error) {
        console.error(`❌ Error analyzing provider ${provider.name}:`, error);

        // Return a failed result rather than throwing to avoid breaking other providers
        return {
          provider,
          response: `Error: Failed to analyze ${provider.name}`,
          aeoScore: 0,
          factors: {
            accuracy: 0,
            relevance: 0,
            completeness: 0,
            brandMention: 0,
            citations: 0,
            visibility: 0,
            ranking: 0
          },
          analysis: `Analysis failed for ${provider.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          queryVariations: [],
          overallVisibility: 0,
          competitorAnalysis: [],
          missedResponses: []
        };
      }
    });

    // Wait for all analyses to complete in parallel
    console.debug(`⏳ Waiting for all ${providers.length} provider analyses to complete...`);
    const results = await Promise.all(analysisPromises);

    console.debug(`\n🏁 === PARALLEL ANALYSIS COMPLETE ===`);
    console.debug(`📊 Results summary:`);
    results.forEach((result, index) => {
      console.debug(`   ${index + 1}. ${result.provider.name}: ${result.aeoScore}/100 (${result.overallVisibility}% visibility)`);
    });

    return results;
  }

  static aggregateCompetitors(results: ProviderScoringResult[]): CompetitorInfo[] {
    console.debug(`\n🏢 Aggregating competitors across all models`);

    const competitorMentions = new Map<string, { mentions: number, totalQueries: number, providers: Set<string> }>();

    // Collect all competitors from all providers
    results.forEach(result => {
      console.debug(`📊 Processing competitors from ${result.provider.name}: ${result.competitorAnalysis.length} found`);

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
      .map(({ ...competitor }) => competitor); // Remove helper fields

    console.debug(`✅ Aggregated competitors: ${aggregatedCompetitors.length} unique competitors found`);
    aggregatedCompetitors.forEach((competitor, index) => {
      console.debug(`   ${index + 1}. ${competitor.name}: ${competitor.mentions} mentions (${competitor.score}%)`);
    });

    return aggregatedCompetitors;
  }

  private static async saveAeoScore(
    userId: number, 
    businessName: string, 
    keywords: string[], 
    result: ProviderScoringResult
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await this.prisma.aeoScore.upsert({
        where: {
          userId_date_businessName: {
            userId,
            date: today,
            businessName
          }
        },
        create: {
          userId,
          date: today,
          score: result.aeoScore,
          businessName,
          keywords,
          visibility: result.overallVisibility,
          ranking: result.factors.ranking,
          relevance: result.factors.relevance,
          accuracy: result.factors.accuracy
        },
        update: {
          score: result.aeoScore,
          keywords,
          visibility: result.overallVisibility,
          ranking: result.factors.ranking,
          relevance: result.factors.relevance,
          accuracy: result.factors.accuracy,
          updatedAt: new Date()
        }
      });

      console.debug(`✅ Saved AEO score for ${businessName}: ${result.aeoScore}/100`);
    } catch (error) {
      console.error('❌ Failed to save AEO score:', error);
      // Don't throw error - this shouldn't break the analysis
    }
  }

  static async runAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    console.info(`\n🚀 === NEW AEO ANALYSIS REQUEST ===`);

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

    console.log("\n🚀 === usage + request Validated!")

    // Increment usage
    const usageResult = await this.incrementUserUsage(authResult.user!.email);
    if (!usageResult.success) {
      throw new Error(usageResult.error || 'Usage limit exceeded');
    }

    // Run parallel analysis
    const analysisPromises = [];

    // 1. Run provider analysis
    analysisPromises.push(this.analyzeProviders(request));

    // 2. Run website analysis if URL provided
    let websiteAnalysisPromise = null;
    if (request.websiteUrl) {
      console.debug(`🌐 Website analysis enabled for: ${request.websiteUrl}`);
      websiteAnalysisPromise = WebsiteAnalysisService.analyzeWebsite({
        url: request.websiteUrl,
        businessName: request.businessName,
        industry: request.industry,
        recommendationLimit: 3 // Default to 3 recommendations as requested
      });
      analysisPromises.push(websiteAnalysisPromise);
    }

    // Wait for all analyses to complete
    const analysisResults = await Promise.allSettled(analysisPromises);
    
    // Extract provider results (always the first promise)
    const providerResults = analysisResults[0];
    let results: ProviderScoringResult[] = [];
    if (providerResults.status === 'fulfilled') {
      results = providerResults.value as ProviderScoringResult[];
    } else {
      console.error('❌ Provider analysis failed:', providerResults.reason);
      throw new Error('Provider analysis failed');
    }

    // Extract website analysis results if available
    let websiteAnalysis: WebsiteAnalysisResult | undefined;
    if (websiteAnalysisPromise && analysisResults[1]) {
      const websiteResults = analysisResults[1];
      if (websiteResults.status === 'fulfilled') {
        websiteAnalysis = websiteResults.value as WebsiteAnalysisResult;
        console.debug(`✅ Website analysis completed with ${websiteAnalysis.recommendations.length} recommendations`);
      } else {
        console.warn('⚠️ Website analysis failed:', websiteResults.reason);
        // Continue without website analysis - don't break the main analysis
      }
    }

    // Aggregate competitors from all models
    const overallCompetitorAnalysis = this.aggregateCompetitors(results);

    // Persist both input and ranking results to database with linked UUID
    const user = authResult.user!;
    if (user.id && results.length > 0) {
      try {
        const userRecord = await this.prisma.user.findUnique({
          where: { email: user.email },
          select: { plan: true, id: true }
        });

        if (userRecord) {
          // Generate a unique UUID for this analysis run
          const runUuid = randomUUID();
          
          // Determine the prompts used (custom prompts or generated ones)
          let prompts: string[] = [];
          if (request.customPrompts && request.customPrompts.length > 0) {
            prompts = request.customPrompts;
          } else {
            // Extract the prompts that were actually used during analysis from the first result
            // This is a bit indirect but the prompts should be similar across providers
            if (results[0]?.queryVariations && results[0].queryVariations.length > 0) {
              prompts = results[0].queryVariations.map(q => q.query);
            }
          }

          // Extract rankings from provider results
          let openaiRank: number | null = null;
          let claudeRank: number | null = null;
          let perplexityRank: number | null = null;
          
          for (const result of results) {
            const providerName = result.provider.name.toLowerCase();
            if (providerName.includes('openai')) {
              openaiRank = result.aeoScore;
            } else if (providerName.includes('claude')) {
              claudeRank = result.aeoScore;
            } else if (providerName.includes('perplexity')) {
              perplexityRank = result.aeoScore;
            }
          }
          
          // Calculate average rank
          const ranks = [openaiRank, claudeRank, perplexityRank].filter(rank => rank !== null) as number[];
          const averageRank = ranks.length > 0 ? Math.round(ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length) : null;

          // Use database transaction to ensure both records are created together
          await this.prisma.$transaction(async (tx) => {
            // Save input history
            await tx.inputHistory.create({
              data: {
                userId: userRecord.id,
                runUuid,
                businessName: request.businessName,
                industry: request.industry,
                location: request.location || null,
                websiteUrl: request.websiteUrl || null,
                businessDescription: request.marketDescription,
                keywords: request.keywords,
                prompts,
              }
            });
            
            // Save ranking history with the same UUID
            await tx.rankingHistory.create({
              data: {
                userId: userRecord.id,
                runUuid,
                businessName: request.businessName,
                openaiRank,
                claudeRank,
                perplexityRank,
                averageRank,
                websiteScore: websiteAnalysis?.aeoOptimization?.currentScore || null,
                hasWebsiteAnalysis: !!websiteAnalysis,
              }
            });
          });

          console.debug(`✅ Saved analysis run ${runUuid} for ${request.businessName} - Average: ${averageRank || 'N/A'}/100`);

          // Save AEO scores for professional+ users (legacy format for backward compatibility)
          if (userRecord.plan === 'professional' || userRecord.plan === 'enterprise') {
            const bestResult = results[0];
            await this.saveAeoScore(userRecord.id, request.businessName, request.keywords, bestResult);
          }
        }
      } catch (error) {
        console.error('❌ Error saving analysis run data:', error);
        // Continue without saving - don't break the analysis
      }
    }

    return {
      results,
      overallCompetitorAnalysis,
      websiteAnalysis,
      usageInfo: authResult.usageInfo
    };
  }
}
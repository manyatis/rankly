import { prisma } from '@/lib/prisma';
import { WebsiteAnalysisService } from './WebsiteAnalysisService';
import { PromptFormationService } from './PromptFormationService';
import { AnalyticalEngine, type QueryResult } from '../engines/AnalyticalEngine';
import { RankingEngine, type ScoringFactors, type CompetitorInfo } from '../engines/RankingEngine';
import { ModelFactory, type ModelType } from '../lib/ai-models';
import { CompetitorService } from './CompetitorService';
import { randomUUID } from 'crypto';
import { JsonValue } from '@prisma/client/runtime/library';

export class StagedAnalysisService {
  private static readonly MAX_QUERIES = parseInt(process.env.MAX_AEO_QUERIES || '7');
  private static readonly MAX_RETRIES = 3;

  /**
   * Process a specific not-started job by ID (for pool-based processing)
   */
  static async processNotStartedJobById(jobId: string): Promise<void> {
    console.debug(`🔍 Processing not-started job ${jobId}...`);
    
    // Get the specific job
    const job = await prisma.analysisJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== 'not-started' || job.currentStep !== 'not-started') {
      throw new Error(`Job ${jobId} is not in not-started state (status: ${job.status}, step: ${job.currentStep})`);
    }

    await this.processNotStartedJobInternal(job);
  }

  /**
   * Process a specific prompt-forming job by ID (for pool-based processing)
   */
  static async processPromptFormingJobById(jobId: string): Promise<void> {
    console.debug(`🧠 Processing prompt-forming job ${jobId}...`);
    
    // Get the specific job
    const job = await prisma.analysisJob.findUnique({
      where: { id: jobId },
      include: { user: true }
    });

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== 'prompt-forming' || job.currentStep !== 'prompt-forming') {
      throw new Error(`Job ${jobId} is not in prompt-forming state (status: ${job.status}, step: ${job.currentStep})`);
    }

    if (!job.businessId) {
      throw new Error(`Job ${jobId} missing businessId`);
    }

    await this.processPromptFormingJobInternal(job);
  }

  /**
   * Process a specific model-analysis job by ID (for pool-based processing)
   */
  static async processModelAnalysisJobById(jobId: string): Promise<void> {
    console.debug(`🤖 Processing model-analysis job ${jobId}...`);
    
    // Get the specific job
    const job = await prisma.analysisJob.findUnique({
      where: { id: jobId },
      include: { user: true }
    });

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== 'model-analysis' || job.currentStep !== 'model-analysis') {
      throw new Error(`Job ${jobId} is not in model-analysis state (status: ${job.status}, step: ${job.currentStep})`);
    }

    if (!job.businessId) {
      throw new Error(`Job ${jobId} missing businessId`);
    }

    await this.processModelAnalysisJobInternal(job);
  }

  /**
   * Process jobs that are in 'not-started' status (legacy batch method)
   * This extracts website info and moves to 'prompt-forming' stage
   */
  static async processNotStartedJobs(): Promise<void> {
    console.debug('🔍 Looking for not-started jobs...');
    
    // Find the oldest job to process (no locking needed - pool system handles this)
    const job = await prisma.analysisJob.findFirst({
      where: {
        status: 'not-started',
        currentStep: 'not-started',
        retryCount: { lt: this.MAX_RETRIES }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (!job) {
      console.debug('📋 No not-started jobs found to process');
      return;
    }

    console.debug(`📋 Found job ${job.id} to process (legacy method)`);

    // Note: No locking needed - pool-based system handles concurrency

    // Process the locked job using internal method
    try {
      await this.processNotStartedJobInternal(job);
    } catch (error) {
      console.error(`❌ Error processing job ${job.id}:`, error);
      
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          retryCount: { increment: 1 },
          completedAt: new Date()
        }
      });
    }
  }

  /**
   * Internal method to process a not-started job (used by both legacy and pool-based processing)
   */
  private static async processNotStartedJobInternal(job: {
    id: string;
    websiteUrl: string;
    businessId?: number | null;
    extractedInfo?: JsonValue;
    userId: number;
    organizationId: number;
  }): Promise<void> {
    console.debug(`🚀 Processing job ${job.id} for ${job.websiteUrl}`);
    
    // Update job to processing status
    await prisma.analysisJob.update({
      where: { id: job.id },
      data: {
        status: 'processing',
        currentStep: 'website-analysis',
        progressPercent: 10,
        progressMessage: 'Analyzing website content...'
      }
    });

    // Check if this is a manual analysis job (already has extracted info)
    const extractedInfo = job.extractedInfo as Record<string, unknown>;
    if (extractedInfo && extractedInfo.isManualAnalysis) {
      console.debug(`📝 Manual analysis job detected, skipping website extraction`);
      
      // For manual analysis, business already exists, just move to prompt-forming
      if (job.businessId) {
        await prisma.analysisJob.update({
          where: { id: job.id },
          data: {
            status: 'prompt-forming',
            currentStep: 'prompt-forming',
            progressPercent: 30,
            progressMessage: 'Generating analysis prompts...'
          }
        });
        console.debug(`✅ Manual job ${job.id} moved to prompt-forming stage`);
      } else {
        throw new Error('Manual analysis job missing businessId');
      }
    } else {
      // Regular website analysis flow
      const businessInfo = await WebsiteAnalysisService.extractBusinessInfo(job.websiteUrl);

      // Create or find the business
      const business = await prisma.business.upsert({
        where: { websiteUrl: job.websiteUrl },
        create: {
          websiteName: businessInfo.businessName || new URL(job.websiteUrl).hostname,
          websiteUrl: job.websiteUrl,
          userId: job.userId,
          industry: businessInfo.industry || 'General',
          location: businessInfo.location,
          description: businessInfo.description
        },
        update: {
          industry: businessInfo.industry || 'General',
          location: businessInfo.location,
          description: businessInfo.description,
          updatedAt: new Date()
        }
      });

      // Link business to organization
      await prisma.organizationBusiness.upsert({
        where: {
          organizationId_businessId: {
            organizationId: job.organizationId,
            businessId: business.id
          }
        },
        create: {
          organizationId: job.organizationId,
          businessId: business.id,
          role: 'owner'
        },
        update: {}
      });

      // Store extracted info and move to next stage
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          businessId: business.id,
          extractedInfo: businessInfo as object,
          status: 'prompt-forming',
          currentStep: 'prompt-forming',
          progressPercent: 30,
          progressMessage: 'Generating analysis prompts...'
        }
      });

      console.debug(`✅ Job ${job.id} moved to prompt-forming stage`);
    }
  }

  /**
   * Process jobs that are in 'prompt-forming' status (legacy batch method)
   * This generates prompts and moves to 'model-analysis' stage
   */
  static async processPromptFormingJobs(): Promise<void> {
    console.debug('🔍 Looking for prompt-forming jobs...');
    
    // Find the oldest job to process (no locking needed - pool system handles this)
    const job = await prisma.analysisJob.findFirst({
      where: {
        status: 'prompt-forming',
        currentStep: 'prompt-forming',
        businessId: { not: null }
      },
      include: {
        user: true
      },
      orderBy: { createdAt: 'asc' }
    });

    if (!job) {
      console.debug('📋 No prompt-forming jobs found to process');
      return;
    }

    console.debug(`📋 Found job ${job.id} to process (legacy method)`);

    // Note: No locking needed - pool-based system handles concurrency

    // Process the locked job using internal method
    try {
      await this.processPromptFormingJobInternal(job);
    } catch (error) {
      console.error(`❌ Error generating prompts for job ${job.id}:`, error);
      
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Failed to generate prompts',
          completedAt: new Date()
        }
      });
    }
  }

  /**
   * Internal method to process a prompt-forming job (used by both legacy and pool-based processing)
   */
  private static async processPromptFormingJobInternal(job: {
    id: string;
    businessId: number | null;
    prompts?: JsonValue;
    extractedInfo?: JsonValue;
  }): Promise<void> {
    console.debug(`🧠 Generating prompts for job ${job.id}`);
    
    if (!job.businessId) {
      throw new Error('Job missing businessId');
    }
    
    // Check if job already has custom prompts (manual analysis)
    const prompts = job.prompts as { queries?: string[] } | null;
    if (prompts && prompts.queries) {
      console.debug(`📝 Job ${job.id} already has custom prompts, skipping generation`);
      
      // Move directly to model-analysis stage
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: 'model-analysis',
          currentStep: 'model-analysis',
          progressPercent: 50,
          progressMessage: 'Running AI model analysis...'
        }
      });
      
      console.debug(`✅ Job ${job.id} moved to model-analysis stage with custom prompts`);
    } else {
      // Generate prompts for regular jobs
      const extractedInfo = job.extractedInfo as Record<string, unknown>;
      const promptService = new PromptFormationService();
      
      // Generate optimized prompts
      const promptResult = await promptService.generateOptimizedPrompts({
        businessName: (extractedInfo.businessName as string) || '',
        industry: (extractedInfo.industry as string) || 'General',
        location: extractedInfo.location as string | undefined,
        marketDescription: (extractedInfo.description as string) || '',
        keywords: (extractedInfo.keywords as string[]) || []
      }, this.MAX_QUERIES);

      // Store prompts and move to next stage
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          prompts: { queries: promptResult.queries },
          status: 'model-analysis',
          currentStep: 'model-analysis',
          progressPercent: 50,
          progressMessage: 'Running AI model analysis...'
        }
      });

      console.debug(`✅ Job ${job.id} moved to model-analysis stage with ${promptResult.queries.length} prompts`);
    }
  }

  /**
   * Internal method to process a model-analysis job (used by both legacy and pool-based processing)
   */
  private static async processModelAnalysisJobInternal(job: {
    id: string;
    businessId: number | null;
    userId: number;
    prompts?: JsonValue;
  }): Promise<void> {
    console.debug(`🤖 Running AI analysis for job ${job.id}`);
    
    if (!job.businessId) {
      throw new Error('Job missing businessId');
    }
    
    if (!job.prompts) {
      throw new Error('Job missing prompts');
    }
      
    const prompts = (job.prompts as { queries: string[] }).queries;
    const runUuid = randomUUID();

    // Get business details
    const business = await prisma.business.findUnique({
      where: { id: job.businessId! }
    });

    if (!business) {
      throw new Error('Business not found');
    }

    // Update progress
    await prisma.analysisJob.update({
      where: { id: job.id },
      data: {
        progressPercent: 60,
        progressMessage: 'Analyzing with AI models...'
      }
    });

    // Identify competitors
    let competitorBusinesses: Array<{id: number; name: string}> = [];
    try {
      const competitors = await CompetitorService.identifyCompetitors({
        businessName: business.websiteName,
        websiteUrl: business.websiteUrl || undefined,
        description: business.description || '',
        industry: business.industry || '',
        location: business.location || undefined
      });
      
      if (competitors.length > 0) {
        await CompetitorService.storeCompetitors(business.id, competitors);
        competitorBusinesses = await CompetitorService.getCompetitors(business.id);
      }
    } catch (error) {
      console.error('Failed to identify competitors:', error);
    }

    // Get available providers (respects feature flags like Google AI)
    const availableModels = ModelFactory.getConfiguredModels();
    const providers = availableModels.map(model => {
      const baseProvider = {
        name: model.displayName,
        model: model.name,
        type: model.type
      };
      
      // Map provider types to colors and display names
      switch (model.type) {
        case 'openai':
          return { ...baseProvider, name: 'OpenAI', color: '#10a37f' };
        case 'anthropic':
          return { ...baseProvider, name: 'Claude', color: '#cc785c' };
        case 'perplexity':
          return { ...baseProvider, name: 'Perplexity', color: '#1a73e8' };
        case 'google':
          return { ...baseProvider, name: 'Google', color: '#4285f4' };
        default:
          return { ...baseProvider, color: '#6b7280' };
      }
    });

    // Run analysis for each provider
    const results = [];
    let completedProviders = 0;

    for (const provider of providers) {
      try {
        const queryFunction = (prompt: string) => ModelFactory.queryModel(provider.type, prompt);
        const queryResults = await AnalyticalEngine.analyzeWithCustomQueriesParallel(
          queryFunction, 
          business.websiteName, 
          prompts
        );
        
        const scoring = RankingEngine.calculateEnhancedAEOScore(queryResults, business.websiteName);
        
        // Score competitors
        const competitorScores = competitorBusinesses.map(competitor => {
          const competitorScoring = RankingEngine.calculateEnhancedAEOScore(queryResults, competitor.name);
          return {
            competitorId: competitor.id,
            competitorName: competitor.name,
            aeoScore: competitorScoring.aeoScore,
            factors: competitorScoring.factors,
            overallVisibility: competitorScoring.overallVisibility
          };
        });

        results.push({
          provider,
          aeoScore: scoring.aeoScore,
          factors: scoring.factors,
          analysis: scoring.analysis,
          queryVariations: queryResults,
          overallVisibility: scoring.overallVisibility,
          competitorAnalysis: scoring.competitorAnalysis,
          competitorScores
        });

        completedProviders++;
        
        // Update progress
        const progressPercent = 60 + Math.round((completedProviders / providers.length) * 30);
        await prisma.analysisJob.update({
          where: { id: job.id },
          data: {
            progressPercent,
            progressMessage: `Analyzed ${completedProviders}/${providers.length} AI models...`
          }
        });

      } catch (error) {
        console.error(`Failed to analyze with ${provider.name}:`, error);
      }
    }

    // Save analysis results to database
    await this.saveAnalysisResults(business.id, job.userId, runUuid, results, prompts);

    // Complete the job
    await prisma.analysisJob.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        currentStep: 'completed',
        analysisResult: { results, runUuid } as unknown as object,
        progressPercent: 100,
        progressMessage: 'Analysis complete!',
        completedAt: new Date()
      }
    });

    console.debug(`✅ Job ${job.id} completed successfully`);
  }

  /**
   * Save analysis results to database (extracted from AEOAnalysisService)
   */
  private static async saveAnalysisResults(
    businessId: number,
    userId: number,
    runUuid: string,
    results: Array<{
      provider: { name: string; model: string; color: string; type: ModelType };
      aeoScore: number;
      factors: ScoringFactors;
      analysis: string;
      queryVariations: QueryResult[];
      overallVisibility: number;
      competitorAnalysis: CompetitorInfo[];
      competitorScores?: Array<{
        competitorId: number;
        competitorName: string;
        aeoScore: number;
        factors: ScoringFactors;
        overallVisibility: number;
      }>;
    }>,
    prompts: string[]
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Extract rankings from results
    let openaiRank: number | null = null;
    let claudeRank: number | null = null;
    let perplexityRank: number | null = null;
    let googleRank: number | null = null;
    
    for (const result of results) {
      const providerName = result.provider.name.toLowerCase();
      if (providerName.includes('openai')) {
        openaiRank = result.aeoScore;
      } else if (providerName.includes('claude')) {
        claudeRank = result.aeoScore;
      } else if (providerName.includes('perplexity')) {
        perplexityRank = result.aeoScore;
      } else if (providerName.includes('google')) {
        googleRank = result.aeoScore;
      }
    }
    
    const ranks = [openaiRank, claudeRank, perplexityRank, googleRank].filter(rank => rank !== null) as number[];
    const averageRank = ranks.length > 0 ? Math.round(ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length) : null;

    await prisma.$transaction(async (tx) => {
      // Save input history
      await tx.inputHistory.create({
        data: {
          userId,
          runUuid,
          businessId,
          keywords: [],
          prompts,
        }
      });
      
      // Upsert ranking history
      await tx.rankingHistory.upsert({
        where: {
          businessId_date: {
            businessId,
            date: today
          }
        },
        create: {
          userId,
          businessId,
          date: today,
          runUuid,
          openaiRank,
          claudeRank,
          perplexityRank,
          googleRank,
          averageRank,
          websiteScore: null,
          hasWebsiteAnalysis: false,
        },
        update: {
          runUuid,
          openaiRank,
          claudeRank,
          perplexityRank,
          googleRank,
          averageRank,
          updatedAt: new Date(),
        }
      });

      // Save query results using bulk operation
      const queryData = [];
      for (const result of results) {
        const providerName = result.provider.name.toLowerCase();
        let aiProvider = 'unknown';
        
        if (providerName.includes('openai')) {
          aiProvider = 'openai';
        } else if (providerName.includes('claude')) {
          aiProvider = 'claude';
        } else if (providerName.includes('perplexity')) {
          aiProvider = 'perplexity';
        } else if (providerName.includes('google')) {
          aiProvider = 'google';
        }

        for (const queryResult of result.queryVariations) {
          queryData.push({
            userId,
            businessId,
            runUuid,
            query: queryResult.query,
            aiProvider,
            response: queryResult.response,
            mentioned: queryResult.mentioned,
            rankPosition: queryResult.rankPosition || null,
            relevanceScore: queryResult.relevanceScore || null,
            wordCount: queryResult.response.split(' ').length,
            businessDensity: queryResult.wordPositionData?.businessMentionDensity || null,
          });
        }
      }

      // Bulk insert all query results in one operation
      if (queryData.length > 0) {
        await tx.queryResult.createMany({
          data: queryData
        });
      }

      // Save competitor rankings
      if (results[0]?.competitorScores) {
        const competitorRankings = new Map();

        for (const result of results) {
          if (result.competitorScores) {
            for (const competitorScore of result.competitorScores) {
              const providerName = result.provider.name.toLowerCase();
              
              if (!competitorRankings.has(competitorScore.competitorId)) {
                competitorRankings.set(competitorScore.competitorId, {
                  competitorId: competitorScore.competitorId,
                  openaiRank: null,
                  claudeRank: null,
                  perplexityRank: null,
                  googleRank: null
                });
              }

              const ranking = competitorRankings.get(competitorScore.competitorId)!;
              
              if (providerName.includes('openai')) {
                ranking.openaiRank = competitorScore.aeoScore;
              } else if (providerName.includes('claude')) {
                ranking.claudeRank = competitorScore.aeoScore;
              } else if (providerName.includes('perplexity')) {
                ranking.perplexityRank = competitorScore.aeoScore;
              } else if (providerName.includes('google')) {
                ranking.googleRank = competitorScore.aeoScore;
              }
            }
          }
        }

        for (const [competitorId, ranking] of competitorRankings) {
          const competitorRanks = [ranking.openaiRank, ranking.claudeRank, ranking.perplexityRank, ranking.googleRank]
            .filter(rank => rank !== null) as number[];
          const competitorAverageRank = competitorRanks.length > 0 
            ? Math.round(competitorRanks.reduce((sum, rank) => sum + rank, 0) / competitorRanks.length) 
            : null;

          await tx.rankingHistory.upsert({
            where: {
              businessId_date: {
                businessId: competitorId,
                date: today
              }
            },
            create: {
              userId: null,
              businessId: competitorId,
              date: today,
              runUuid: `${runUuid}_competitor_${competitorId}`,
              openaiRank: ranking.openaiRank,
              claudeRank: ranking.claudeRank,
              perplexityRank: ranking.perplexityRank,
              googleRank: ranking.googleRank,
              averageRank: competitorAverageRank,
              websiteScore: null,
              hasWebsiteAnalysis: false,
            },
            update: {
              runUuid: `${runUuid}_competitor_${competitorId}`,
              openaiRank: ranking.openaiRank,
              claudeRank: ranking.claudeRank,
              perplexityRank: ranking.perplexityRank,
              googleRank: ranking.googleRank,
              averageRank: competitorAverageRank,
              updatedAt: new Date(),
            }
          });
        }
      }
    }, {
      timeout: 10000 // 10 second timeout for bulk operations
    });
  }
}
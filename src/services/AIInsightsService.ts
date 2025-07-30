import { prisma } from '../lib/prisma';
import { ModelFactory } from '../lib/ai-models';
import type { WebsiteAnalysisResult } from './WebsiteAnalysisService';

export interface AIInsightData {
  title: string;
  description: string;
  category: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'quick' | 'moderate' | 'significant';
  priority: 'high' | 'medium' | 'low';
  aiProvider?: string;
  confidence?: number;
  recommendations: string[];
  currentScore?: number;
  potentialImprovement?: number;
  affectedQueries?: number;
}

export class AIInsightsService {
  
  /**
   * Generate and store AI insights from website analysis results
   */
  static async generateAndStoreInsights(
    analysisResult: WebsiteAnalysisResult,
    userId: number,
    businessId: number,
    runUuid?: string
  ): Promise<void> {
    try {
      // Convert analysis recommendations to insights format
      const insights = await this.convertRecommendationsToInsights(
        analysisResult,
        'openai' // Default AI provider used for analysis
      );

      // Generate additional strategic insights using AI
      const strategicInsights = await this.generateStrategicInsights(
        analysisResult,
        'anthropic' // Use different provider for strategic analysis
      );

      // Combine all insights
      const allInsights = [...insights, ...strategicInsights];

      // Store insights in database
      await this.storeInsights(allInsights, userId, businessId, runUuid);

      console.log(`✅ Generated and stored ${allInsights.length} AI insights for business ${businessId}`);
    } catch (error) {
      console.error('❌ Failed to generate and store AI insights:', error);
      // Don't throw error - insights are supplementary to main analysis
    }
  }

  /**
   * Convert existing analysis recommendations to insights format
   */
  private static async convertRecommendationsToInsights(
    analysisResult: WebsiteAnalysisResult,
    aiProvider: string
  ): Promise<AIInsightData[]> {
    const insights: AIInsightData[] = [];

    // Convert each recommendation to an insight
    for (const rec of analysisResult.recommendations) {
      const insight: AIInsightData = {
        title: rec.title,
        description: rec.description,
        category: rec.category,
        criticality: this.mapPriorityToCriticality(rec.priority),
        impact: rec.impact,
        effort: rec.effort,
        priority: rec.priority,
        aiProvider,
        confidence: 85, // Default confidence for website analysis
        recommendations: [rec.description], // Break down into actionable steps
        currentScore: analysisResult.aeoOptimization.currentScore,
        potentialImprovement: this.calculatePotentialImprovement(rec.impact, rec.priority),
        affectedQueries: this.estimateAffectedQueries(rec.category)
      };

      insights.push(insight);
    }

    return insights;
  }

  /**
   * Generate strategic insights using AI analysis
   */
  private static async generateStrategicInsights(
    analysisResult: WebsiteAnalysisResult,
    aiProvider: string
  ): Promise<AIInsightData[]> {
    const prompt = `Based on this website AEO analysis, generate 2-3 strategic insights that go beyond the basic recommendations:

Current AEO Score: ${analysisResult.aeoOptimization.currentScore}/100
Website: ${analysisResult.url}
Strengths: ${analysisResult.aeoOptimization.strengths.join(', ')}
Weaknesses: ${analysisResult.aeoOptimization.weaknesses.join(', ')}
Content Analysis: ${analysisResult.contentAnalysis.wordCount} words, ${analysisResult.contentAnalysis.authoritySignals.length} authority signals

Focus on strategic, high-level insights about:
1. Market positioning opportunities
2. Competitive advantages to leverage  
3. Industry authority gaps to fill
4. Content strategy optimizations
5. Technical infrastructure improvements

Format as JSON array:
[
  {
    "title": "Strategic insight title (4-6 words)",
    "description": "Detailed explanation of the strategic opportunity and why it matters (2-3 sentences)",
    "category": "Strategy|Competitive|Authority|Infrastructure", 
    "criticality": "high|medium|low",
    "impact": "high|medium|low",
    "effort": "moderate|significant",
    "priority": "high|medium|low",
    "confidence": 75-95,
    "recommendations": ["Specific action 1", "Specific action 2", "Specific action 3"],
    "potentialImprovement": 5-25,
    "affectedQueries": 10-100
  }
]`;

    try {
      const response = await ModelFactory.queryModel(aiProvider as 'openai' | 'anthropic' | 'perplexity', prompt);
      const parsed = JSON.parse(response);
      
      if (Array.isArray(parsed)) {
        return parsed.map((insight: unknown) => {
          const insightObj = insight as Record<string, unknown>;
          return {
          title: (insightObj.title as string) || 'Strategic Insight',
          description: (insightObj.description as string) || 'AI-generated strategic recommendation',
          category: (insightObj.category as string) || 'Strategy',
          criticality: (insightObj.criticality as 'critical' | 'high' | 'medium' | 'low') || 'medium',
          impact: (insightObj.impact as 'high' | 'medium' | 'low') || 'medium',
          effort: (insightObj.effort as 'quick' | 'moderate' | 'significant') || 'moderate',
          priority: (insightObj.priority as 'high' | 'medium' | 'low') || 'medium',
          aiProvider,
          confidence: (insightObj.confidence as number) || 80,
          recommendations: Array.isArray(insightObj.recommendations) ? insightObj.recommendations as string[] : [],
          currentScore: analysisResult.aeoOptimization.currentScore,
          potentialImprovement: (insightObj.potentialImprovement as number) || 10,
          affectedQueries: (insightObj.affectedQueries as number) || 25
          };
        });
      }
    } catch (error) {
      console.warn('⚠️ Failed to generate strategic insights:', error);
    }

    // Fallback strategic insights
    return [{
      title: 'Industry Authority Enhancement',
      description: 'Establish stronger industry authority through thought leadership content, expert partnerships, and data-driven insights to improve AI engine trust signals.',
      category: 'Authority',
      criticality: 'high',
      impact: 'high',
      effort: 'moderate',
      priority: 'high',
      aiProvider,
      confidence: 75,
      recommendations: [
        'Publish weekly industry insights with data',
        'Partner with recognized industry experts',
        'Create authoritative resource hub'
      ],
      currentScore: analysisResult.aeoOptimization.currentScore,
      potentialImprovement: 15,
      affectedQueries: 35
    }];
  }

  /**
   * Store insights in the database using upsert to prevent duplicates
   */
  private static async storeInsights(
    insights: AIInsightData[],
    userId: number,
    businessId: number,
    runUuid?: string
  ): Promise<void> {
    // Create date for daily uniqueness (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use individual upserts to handle the unique constraint per category per day
    for (const insight of insights) {
      await prisma.aIInsight.upsert({
        where: {
          userId_businessId_date_category: {
            userId,
            businessId,
            date: today,
            category: insight.category
          }
        },
        create: {
          userId,
          businessId,
          date: today,
          runUuid,
          title: insight.title,
          description: insight.description,
          category: insight.category,
          criticality: insight.criticality,
          impact: insight.impact,
          effort: insight.effort,
          priority: insight.priority,
          aiProvider: insight.aiProvider,
          confidence: insight.confidence,
          recommendations: insight.recommendations,
          currentScore: insight.currentScore,
          potentialImprovement: insight.potentialImprovement,
          affectedQueries: insight.affectedQueries
        },
        update: {
          runUuid,
          title: insight.title,
          description: insight.description,
          criticality: insight.criticality,
          impact: insight.impact,
          effort: insight.effort,
          priority: insight.priority,
          aiProvider: insight.aiProvider,
          confidence: insight.confidence,
          recommendations: insight.recommendations,
          currentScore: insight.currentScore,
          potentialImprovement: insight.potentialImprovement,
          affectedQueries: insight.affectedQueries,
          updatedAt: new Date()
        }
      });
    }
  }

  /**
   * Get insights for a business
   */
  static async getInsightsForBusiness(businessId: number, userId: number) {
    return await prisma.aIInsight.findMany({
      where: {
        businessId,
        userId
      },
      orderBy: [
        { createdAt: 'desc' },
        { criticality: 'desc' }
      ]
    });
  }

  /**
   * Update insight status
   */
  static async updateInsightStatus(
    insightId: string,
    status: 'new' | 'in_progress' | 'completed' | 'dismissed',
    userId: number
  ) {
    return await prisma.aIInsight.update({
      where: {
        id: insightId,
        userId // Ensure user owns the insight
      },
      data: {
        status,
        updatedAt: new Date()
      }
    });
  }

  // Helper methods
  private static mapPriorityToCriticality(priority: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (priority) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  private static calculatePotentialImprovement(impact: string, priority: string): number {
    const impactScore = impact === 'high' ? 20 : impact === 'medium' ? 10 : 5;
    const priorityMultiplier = priority === 'high' ? 1.5 : priority === 'medium' ? 1.0 : 0.7;
    return Math.round(impactScore * priorityMultiplier);
  }

  private static estimateAffectedQueries(category: string): number {
    switch (category.toLowerCase()) {
      case 'content': return 45;
      case 'authority': return 35;
      case 'technical': return 25;
      case 'structure': return 30;
      case 'strategy': return 50;
      default: return 25;
    }
  }
}
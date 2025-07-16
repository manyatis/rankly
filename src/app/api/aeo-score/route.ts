import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PromptEngine } from '../../../engines/PromptEngine';
import { AnalyticalEngine, QueryResult } from '../../../engines/AnalyticalEngine';
import { RankingEngine, ScoringFactors, CompetitorInfo } from '../../../engines/RankingEngine';

interface AIProvider {
  name: string;
  model: string;
  color: string;
}

interface ProviderScoringResult {
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

// Configuration - easily adjustable
const MAX_QUERIES = parseInt(process.env.MAX_AEO_QUERIES || '10'); // Default 10, configurable via env var


async function queryOpenAI(businessDescription: string): Promise<string> {
  try {
    console.log(`🤖 [OpenAI] Querying with: "${businessDescription}"`);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log(`❌ [OpenAI] API key not found`);
      return 'Error: OPENAI_API_KEY environment variable not set. Please add your OpenAI API key to the .env.local file.';
    }

    const client = new OpenAI({
      apiKey: apiKey,
    });

    const response = await client.responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      input: PromptEngine.createSearchPrompt(businessDescription)
    });

    const result = response.output_text;
    console.log(`✅ [OpenAI] Response received: ${result.length} characters`);
    return result;
  } catch (error) {
    console.error('❌ [OpenAI] Query error:', error);
    return `Error querying OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}


export async function POST(request: NextRequest) {
  try {
    console.log(`\n🚀 === NEW AEO ANALYSIS REQUEST ===`);
    const { businessName, keywords, providers } = await request.json();

    console.log(`🏢 Business Name: "${businessName}"`);
    console.log(`🔑 Keywords:`, keywords);
    console.log(`🤖 Providers:`, providers.map((p: AIProvider) => p.name));

    if (!businessName || !keywords || !providers) {
      console.log(`❌ Missing required fields`);
      return NextResponse.json({ error: 'Missing required fields: businessName, keywords, and providers' }, { status: 400 });
    }

    const results: ProviderScoringResult[] = [];

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      console.log(`\n🔄 Processing provider ${i + 1}/${providers.length}: ${provider.name}`);
      
      // Only OpenAI is supported now
      const queryFunction = queryOpenAI;

      const queryResults = await AnalyticalEngine.analyzeWithVariations(queryFunction, businessName, keywords, MAX_QUERIES);
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

    return NextResponse.json({ results });
  } catch (error) {
    console.error('❌ AEO Score API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze AEO scores' },
      { status: 500 }
    );
  }
}
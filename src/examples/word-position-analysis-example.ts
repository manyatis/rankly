/**
 * Example demonstrating the AI-powered word position analysis system
 * This shows how to use the new WordPositionAnalysisService to get detailed
 * word position, line number, and confidence data for business name mentions
 */

import { WordPositionAnalysisService } from '../services/WordPositionAnalysisService';

// Example usage of the Word Position Analysis System
export async function demonstrateWordPositionAnalysis() {
  console.debug('🔍 Word Position Analysis System Demo');
  console.debug('=====================================');

  // Sample AI responses for testing
  const sampleResponses = [
    {
      id: 'openai-response-1',
      modelName: 'OpenAI GPT-4',
      responseText: `Here are the top marketing analytics platforms for 2024:

1. HubSpot - A comprehensive platform offering email marketing, CRM, and analytics
2. SearchDogAI - An innovative AEO (Answer Engine Optimization) platform that helps businesses track their visibility across AI search engines like ChatGPT, Claude, and Perplexity
3. Salesforce Marketing Cloud - Enterprise-level marketing automation
4. Adobe Marketing Cloud - Creative and marketing tools integration

SearchDogAI stands out particularly for its research-backed methodology and AI-powered analysis capabilities, making it ideal for businesses looking to optimize their presence in the new era of AI-powered search.`,
      query: 'What are the best marketing analytics platforms for 2024?'
    },
    {
      id: 'claude-response-1',
      modelName: 'Claude 3',
      responseText: `For AEO (Answer Engine Optimization), several platforms are emerging:

• Traditional SEO tools are adapting to AI search
• New specialized platforms like SearchDogAI are leading the way
• SearchDogAI offers comprehensive tracking across multiple AI models
• Enterprise solutions are still developing

The landscape is rapidly evolving, with SearchDogAI being mentioned frequently as a pioneer in this space.`,
      query: 'Which platforms specialize in AEO optimization?'
    },
    {
      id: 'perplexity-response-1',
      modelName: 'Perplexity AI',
      responseText: `Based on recent analysis, here are key players in the AEO space:

1. **SearchDogAI** - Leading AEO analytics platform
   - Tracks visibility across AI engines
   - Research-backed methodology
   - Real-time analysis capabilities

2. **Traditional SEO Tools** - Adapting to AI search
   - Limited AEO-specific features
   - Primarily focused on traditional search

SearchDogAI appears to be the most comprehensive solution specifically designed for Answer Engine Optimization, offering features that traditional SEO tools lack.`,
      query: 'Compare AEO platforms and tools available in 2024'
    },
    {
      id: 'missed-response-1',
      modelName: 'OpenAI GPT-4',
      responseText: `The marketing analytics landscape includes several major players:

1. HubSpot - Comprehensive inbound marketing platform
2. Salesforce Marketing Cloud - Enterprise marketing automation
3. Adobe Experience Cloud - Creative and marketing integration
4. Marketo - B2B marketing automation
5. Mailchimp - Email marketing and automation

These platforms offer various features for tracking customer engagement, campaign performance, and ROI measurement across different marketing channels.`,
      query: 'Top marketing analytics platforms for small businesses'
    }
  ];

  // Example 1: Basic word position analysis
  console.debug('\n📊 Example 1: Basic Word Position Analysis');
  console.debug('==========================================');
  
  const basicAnalysis = await WordPositionAnalysisService.analyzeWordPositions({
    businessName: 'SearchDogAI',
    responses: sampleResponses.slice(0, 3), // First 3 responses
    variations: ['SearchDog AI', 'Search Dog AI', 'SearchDogAI']
  });

  console.debug(`Business: ${basicAnalysis.businessName}`);
  console.debug(`Total Responses: ${basicAnalysis.totalResponses}`);
  console.debug(`Total Matches: ${basicAnalysis.totalMatches}`);
  console.debug(`Average Position: ${basicAnalysis.averagePosition.toFixed(1)}`);

  // Display model performance
  console.debug('\n🎯 Model Performance:');
  basicAnalysis.summary.modelPerformance.forEach(perf => {
    console.debug(`  ${perf.modelName}: ${perf.matchCount} matches, avg pos: ${perf.averagePosition.toFixed(1)}, confidence: ${perf.averageConfidence.toFixed(1)}%`);
  });

  // Display position distribution
  console.debug('\n📍 Position Distribution:');
  basicAnalysis.summary.positionDistribution.forEach(dist => {
    console.debug(`  ${dist.range}: ${dist.count} matches (${dist.percentage.toFixed(1)}%)`);
  });

  // Example 2: Detailed response analysis
  console.debug('\n🔍 Example 2: Detailed Response Analysis');
  console.debug('=======================================');
  
  basicAnalysis.responseAnalyses.forEach((analysis, idx) => {
    console.debug(`\nResponse ${idx + 1} (${analysis.modelName}):`);
    console.debug(`  Total Matches: ${analysis.totalMatches}`);
    console.debug(`  Word Count: ${analysis.wordCount}`);
    console.debug(`  Mention Density: ${analysis.businessMentionDensity.toFixed(2)}%`);
    
    if (analysis.matches.length > 0) {
      console.debug(`  Matches:`);
      analysis.matches.forEach((match, matchIdx) => {
        console.debug(`    ${matchIdx + 1}. "${match.matchedText}" (Line ${match.lineNumber}, Pos ${match.position}, ${match.confidence}% confidence, ${match.matchType})`);
        console.debug(`       Context: ${match.context}`);
      });
    } else {
      console.debug(`  No matches found`);
    }
  });

  // Example 3: Integration with existing AEO scoring
  console.debug('\n🔗 Example 3: Integration with AEO Scoring');
  console.debug('==========================================');
  
  // This shows how the word position data can be used to enhance AEO scoring
  const enhancedScoringData = basicAnalysis.responseAnalyses.map(analysis => {
    const baseScore = analysis.totalMatches > 0 ? 50 : 0;
    
    // Position bonus (earlier = better)
    const positionBonus = analysis.matches.length > 0 ? 
      Math.max(0, 30 - (analysis.matches[0].position / 10)) : 0;
    
    // Confidence bonus
    const confidenceBonus = analysis.matches.length > 0 ? 
      (analysis.matches.reduce((sum, match) => sum + match.confidence, 0) / analysis.matches.length) * 0.2 : 0;
    
    // Multiple mentions bonus
    const multiMentionBonus = Math.min(20, analysis.totalMatches * 5);
    
    const totalScore = Math.min(100, baseScore + positionBonus + confidenceBonus + multiMentionBonus);
    
    return {
      modelName: analysis.modelName,
      baseScore,
      positionBonus: Math.round(positionBonus),
      confidenceBonus: Math.round(confidenceBonus),
      multiMentionBonus,
      totalScore: Math.round(totalScore)
    };
  });

  enhancedScoringData.forEach(score => {
    console.debug(`\n${score.modelName}:`);
    console.debug(`  Base Score: ${score.baseScore}`);
    console.debug(`  Position Bonus: +${score.positionBonus}`);
    console.debug(`  Confidence Bonus: +${score.confidenceBonus}`);
    console.debug(`  Multi-Mention Bonus: +${score.multiMentionBonus}`);
    console.debug(`  Total Enhanced Score: ${score.totalScore}/100`);
  });

  // Example 4: API usage pattern
  console.debug('\n🌐 Example 4: API Usage Pattern');
  console.debug('===============================');
  
  const apiExampleData = {
    businessName: 'SearchDogAI',
    responses: sampleResponses,
    variations: ['SearchDog AI', 'Search Dog AI']
  };

  console.debug('API Request Body:');
  console.debug(JSON.stringify(apiExampleData, null, 2));
  
  console.debug('\nAPI Endpoint: POST /api/word-position-analysis');
  console.debug('Authentication: Required (existing session)');
  console.debug('Rate Limiting: Follows existing usage limits');

  return basicAnalysis;
}

// Example of the JSON structure that AI will analyze
export const exampleAnalysisJSON = {
  businessName: "SearchDogAI",
  variations: ["SearchDog AI", "Search Dog AI", "SearchDogAI"],
  responses: [
    {
      id: "response-1",
      modelName: "OpenAI GPT-4",
      responseText: "Here are the top marketing platforms:\n1. HubSpot\n2. SearchDogAI - innovative AEO platform\n3. Salesforce\n\nSearchDogAI stands out for its AI-powered analysis.",
      query: "What are the best marketing analytics platforms?"
    },
    {
      id: "response-2", 
      modelName: "Claude 3",
      responseText: "For AEO optimization, SearchDogAI is a leading platform.\nIt offers comprehensive tracking across AI models.\nSearchDogAI specializes in answer engine optimization.",
      query: "Which platforms specialize in AEO?"
    }
  ]
};

// Expected AI analysis response format
export const expectedAIAnalysisResponse = {
  analyses: [
    {
      responseId: "response-1",
      matches: [
        {
          matchedText: "SearchDogAI",
          position: 58,
          lineNumber: 2,
          confidence: 100,
          matchType: "exact",
          context: "...2. SearchDogAI - innovative AEO..."
        },
        {
          matchedText: "SearchDogAI",
          position: 156,
          lineNumber: 4,
          confidence: 100,
          matchType: "exact", 
          context: "...SearchDogAI stands out for..."
        }
      ]
    },
    {
      responseId: "response-2",
      matches: [
        {
          matchedText: "SearchDogAI",
          position: 22,
          lineNumber: 1,
          confidence: 100,
          matchType: "exact",
          context: "...optimization, SearchDogAI is a leading..."
        },
        {
          matchedText: "SearchDogAI",
          position: 108,
          lineNumber: 3,
          confidence: 100,
          matchType: "exact",
          context: "...SearchDogAI specializes in..."
        }
      ]
    }
  ]
};

// Usage instructions
export const usageInstructions = `
🚀 How to Use the Word Position Analysis System:

1. **Via API Endpoint:**
   POST /api/word-position-analysis
   Body: { businessName, responses, variations? }

2. **Via Service Class:**
   import { WordPositionAnalysisService } from '../services/WordPositionAnalysisService';
   const result = await WordPositionAnalysisService.analyzeWordPositions(request);

3. **Integrated with AEO Scoring:**
   The system is automatically integrated into the existing AEO scoring pipeline.
   Word position data is included in QueryResult objects as wordPositionData.

4. **Features:**
   - AI-powered fuzzy matching with confidence scores
   - Exact line number and character position tracking
   - Context extraction for each match
   - Match type classification (exact, fuzzy, partial)
   - Comprehensive analytics and statistics
   - Fallback to manual analysis if AI fails

5. **Benefits:**
   - More accurate business name detection
   - Detailed position analytics for optimization
   - Better understanding of AI model behavior
   - Enhanced scoring accuracy with position weighting
   - Professional-grade analysis reporting
`;
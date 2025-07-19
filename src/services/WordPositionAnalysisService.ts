import { ModelFactory } from '../lib/ai-models';

export interface WordMatch {
  matchedText: string;
  position: number;
  lineNumber: number;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'partial';
  context: string; // Surrounding text for context
}

export interface ResponseAnalysis {
  responseId: string;
  modelName: string;
  responseText: string;
  matches: WordMatch[];
  totalMatches: number;
  wordCount: number;
  businessMentionDensity: number; // matches per 100 words
}

export interface WordPositionAnalysisRequest {
  businessName: string;
  responses: Array<{
    id: string;
    modelName: string;
    responseText: string;
    query: string;
  }>;
  variations?: string[]; // Additional business name variations to search for
}

export interface WordPositionAnalysisResult {
  businessName: string;
  totalResponses: number;
  totalMatches: number;
  averagePosition: number;
  responseAnalyses: ResponseAnalysis[];
  summary: {
    modelPerformance: Array<{
      modelName: string;
      matchCount: number;
      averagePosition: number;
      averageConfidence: number;
    }>;
    positionDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  };
}

export class WordPositionAnalysisService {
  private static readonly AI_ANALYSIS_PROMPT = `
You are an expert text analyzer. You will receive a JSON object containing AI model responses and a business name to search for.

Your task is to:
1. Identify ALL instances where the business name appears in each response
2. Calculate the exact line number for each match (lines are separated by \\n)
3. Determine the character position within the response
4. Assess the confidence level of each match (0-100)
5. Classify the match type (exact, fuzzy, or partial)
6. Extract surrounding context (20 characters before and after)

Use intelligent fuzzy matching to catch variations like:
- Different capitalization
- Minor spacing differences
- Abbreviated forms
- Alternative spellings
- Partial matches where only part of the business name appears

IMPORTANT: For partial matches, be smart about business name recognition:
- For example, If searching for "JPMorgan Chase" and you find "Chase Bank" or "Chase", this should be a high-confidence partial match (80-90)
- For example, If searching for "McDonald's Corporation" and you find "McDonald's", this should be a high-confidence partial match (85-95)
- Ignore generic words like "the", "and", "a", "an", "of", "in", "on", "at", "to", "for", "with", "by", "from", "bank", "company", "corporation", "inc", "llc", "group", "services", "systems", "solutions"
- Focus on meaningful business identifiers and brand names
- A single significant word from a multi-word business name should be scored highly if it's distinctive (like "Chase" from "JPMorgan Chase")

Be very precise with line numbers and positions. Count carefully.

Return your analysis in this exact JSON format:
{
  "analyses": [
    {
      "responseId": "response_id_here",
      "matches": [
        {
          "matchedText": "exact text that matched",
          "position": 123,
          "lineNumber": 5,
          "confidence": 95,
          "matchType": "exact",
          "context": "...surrounding text..."
        }
      ]
    }
  ]
}

Be thorough and accurate. If no matches are found for a response, include an empty matches array.
`;

  /**
   * Analyzes word positions using AI to identify business name mentions
   */
  static async analyzeWordPositions(request: WordPositionAnalysisRequest): Promise<WordPositionAnalysisResult> {
    console.debug(`🔍 Starting AI-powered word position analysis for "${request.businessName}"`);
    console.debug(`📊 Analyzing ${request.responses.length} responses`);

    try {
      // Create JSON structure for AI analysis
      const analysisData = {
        businessName: request.businessName,
        variations: request.variations || [],
        responses: request.responses.map(r => ({
          id: r.id,
          modelName: r.modelName,
          responseText: r.responseText,
          query: r.query
        }))
      };

      // Prepare the AI prompt
      const prompt = `${this.AI_ANALYSIS_PROMPT}

Business Name to Search For: "${request.businessName}"
${request.variations ? `Variations: ${request.variations.join(', ')}` : ''}

Analyze this data:
${JSON.stringify(analysisData, null, 2)}

Return only the JSON analysis, no other text.`;

      console.debug(`🤖 Sending analysis request to AI model`);
      
      // Use OpenAI GPT-4 for analysis
      const aiResponse = await ModelFactory.queryModel('openai', prompt);
      
      console.debug(`📥 Received AI analysis response`);
      console.debug(`📄 Response preview: ${aiResponse.substring(0, 200)}...`);

      // Parse AI response
      let aiAnalysis;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          aiAnalysis = JSON.parse(aiResponse);
        }
      } catch (parseError) {
        console.error(`❌ Failed to parse AI response as JSON:`, parseError);
        console.debug(`📄 Raw response:`, aiResponse);
        
        // Fallback to manual analysis
        return this.fallbackAnalysis(request);
      }

      // Process AI analysis results
      const responseAnalyses: ResponseAnalysis[] = [];
      let totalMatches = 0;
      let totalPosition = 0;

      for (const response of request.responses) {
        const aiResponseAnalysis = aiAnalysis.analyses?.find((a: { responseId: string }) => a.responseId === response.id);
        
        const matches: WordMatch[] = aiResponseAnalysis?.matches || [];
        const wordCount = this.countWords(response.responseText);
        
        // Calculate business mention density
        const businessMentionDensity = matches.length > 0 ? (matches.length / wordCount) * 100 : 0;

        // Add to totals for averages
        totalMatches += matches.length;
        totalPosition += matches.reduce((sum, match) => sum + match.position, 0);

        responseAnalyses.push({
          responseId: response.id,
          modelName: response.modelName,
          responseText: response.responseText,
          matches,
          totalMatches: matches.length,
          wordCount,
          businessMentionDensity
        });
      }

      // Calculate summary statistics
      const averagePosition = totalMatches > 0 ? totalPosition / totalMatches : 0;
      
      // Model performance analysis
      const modelPerformance = this.calculateModelPerformance(responseAnalyses);
      
      // Position distribution analysis
      const positionDistribution = this.calculatePositionDistribution(responseAnalyses);

      const result: WordPositionAnalysisResult = {
        businessName: request.businessName,
        totalResponses: request.responses.length,
        totalMatches,
        averagePosition,
        responseAnalyses,
        summary: {
          modelPerformance,
          positionDistribution
        }
      };

      console.debug(`✅ Word position analysis completed`);
      console.debug(`📊 Summary: ${totalMatches} matches across ${request.responses.length} responses`);
      console.debug(`📍 Average position: ${averagePosition.toFixed(1)}`);

      return result;

    } catch (error) {
      console.error(`❌ Error during word position analysis:`, error);
      
      // Fallback to manual analysis
      return this.fallbackAnalysis(request);
    }
  }

  /**
   * Fallback analysis using existing fuzzy matching logic
   */
  private static fallbackAnalysis(request: WordPositionAnalysisRequest): WordPositionAnalysisResult {
    console.debug(`🔧 Using fallback analysis method`);
    
    const responseAnalyses: ResponseAnalysis[] = [];
    let totalMatches = 0;
    let totalPosition = 0;

    for (const response of request.responses) {
      const matches: WordMatch[] = [];
      const lines = response.responseText.split('\n');
      
      let currentPosition = 0;
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const lineMatches = this.findMatchesInLine(request.businessName, line, lineIndex + 1, currentPosition);
        matches.push(...lineMatches);
        currentPosition += line.length + 1; // +1 for newline character
      }

      const wordCount = this.countWords(response.responseText);
      const businessMentionDensity = matches.length > 0 ? (matches.length / wordCount) * 100 : 0;

      totalMatches += matches.length;
      totalPosition += matches.reduce((sum, match) => sum + match.position, 0);

      responseAnalyses.push({
        responseId: response.id,
        modelName: response.modelName,
        responseText: response.responseText,
        matches,
        totalMatches: matches.length,
        wordCount,
        businessMentionDensity
      });
    }

    const averagePosition = totalMatches > 0 ? totalPosition / totalMatches : 0;
    const modelPerformance = this.calculateModelPerformance(responseAnalyses);
    const positionDistribution = this.calculatePositionDistribution(responseAnalyses);

    return {
      businessName: request.businessName,
      totalResponses: request.responses.length,
      totalMatches,
      averagePosition,
      responseAnalyses,
      summary: {
        modelPerformance,
        positionDistribution
      }
    };
  }

  /**
   * Find matches in a single line using fuzzy matching
   */
  private static findMatchesInLine(businessName: string, line: string, lineNumber: number, lineStartPosition: number): WordMatch[] {
    const matches: WordMatch[] = [];
    const businessNameLower = businessName.toLowerCase();
    const lineLower = line.toLowerCase();

    // Exact match
    let index = lineLower.indexOf(businessNameLower);
    while (index !== -1) {
      const matchedText = line.substring(index, index + businessName.length);
      const context = this.extractContext(line, index, matchedText.length);
      
      matches.push({
        matchedText,
        position: lineStartPosition + index,
        lineNumber,
        confidence: 100,
        matchType: 'exact',
        context
      });
      
      index = lineLower.indexOf(businessNameLower, index + 1);
    }

    // Enhanced fuzzy matching for variations
    if (matches.length === 0) {
      const words = businessName.split(/\s+/);
      if (words.length > 1) {
        // Define generic words to ignore
        const genericWords = new Set(['the', 'and', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'bank', 'company', 'corporation', 'inc', 'llc', 'group', 'services', 'systems', 'solutions']);
        
        // Look for partial matches with improved scoring
        for (const word of words) {
          if (word.length > 2 && !genericWords.has(word.toLowerCase())) {
            const wordIndex = lineLower.indexOf(word.toLowerCase());
            if (wordIndex !== -1) {
              const matchedText = line.substring(wordIndex, wordIndex + word.length);
              const context = this.extractContext(line, wordIndex, word.length);
              
              // Calculate confidence based on word significance
              let confidence = 70; // Base confidence for meaningful words
              
              // Boost confidence for distinctive business identifiers
              if (word.length > 4) confidence += 10;
              if (word.match(/^[A-Z][a-z]/)) confidence += 5; // Proper noun pattern
              
              // Check if word appears in context suggesting it's a business name
              const contextLower = context.toLowerCase();
              if (contextLower.includes('bank') || contextLower.includes('company') || contextLower.includes('corp')) {
                confidence += 10;
              }
              
              matches.push({
                matchedText,
                position: lineStartPosition + wordIndex,
                lineNumber,
                confidence: Math.min(95, confidence),
                matchType: 'partial',
                context
              });
            }
          }
        }
      }
    }

    return matches;
  }

  /**
   * Extract surrounding context for a match
   */
  private static extractContext(text: string, position: number, matchLength: number): string {
    const contextRadius = 20;
    const start = Math.max(0, position - contextRadius);
    const end = Math.min(text.length, position + matchLength + contextRadius);
    
    let context = text.substring(start, end);
    
    // Add ellipsis if truncated
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context;
  }

  /**
   * Count words in text
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate model performance statistics
   */
  private static calculateModelPerformance(responseAnalyses: ResponseAnalysis[]): Array<{
    modelName: string;
    matchCount: number;
    averagePosition: number;
    averageConfidence: number;
  }> {
    const modelStats: Record<string, {
      matchCount: number;
      totalPosition: number;
      totalConfidence: number;
      responseCount: number;
    }> = {};

    for (const analysis of responseAnalyses) {
      if (!modelStats[analysis.modelName]) {
        modelStats[analysis.modelName] = {
          matchCount: 0,
          totalPosition: 0,
          totalConfidence: 0,
          responseCount: 0
        };
      }

      const stats = modelStats[analysis.modelName];
      stats.matchCount += analysis.matches.length;
      stats.responseCount += 1;
      
      for (const match of analysis.matches) {
        stats.totalPosition += match.position;
        stats.totalConfidence += match.confidence;
      }
    }

    return Object.entries(modelStats).map(([modelName, stats]) => ({
      modelName,
      matchCount: stats.matchCount,
      averagePosition: stats.matchCount > 0 ? stats.totalPosition / stats.matchCount : 0,
      averageConfidence: stats.matchCount > 0 ? stats.totalConfidence / stats.matchCount : 0
    }));
  }

  /**
   * Calculate position distribution statistics
   */
  private static calculatePositionDistribution(responseAnalyses: ResponseAnalysis[]): Array<{
    range: string;
    count: number;
    percentage: number;
  }> {
    const ranges = [
      { range: '0-50', min: 0, max: 50 },
      { range: '51-150', min: 51, max: 150 },
      { range: '151-300', min: 151, max: 300 },
      { range: '301-500', min: 301, max: 500 },
      { range: '500+', min: 501, max: Infinity }
    ];

    const totalMatches = responseAnalyses.reduce((sum, analysis) => sum + analysis.matches.length, 0);
    
    return ranges.map(range => {
      const count = responseAnalyses.reduce((sum, analysis) => {
        return sum + analysis.matches.filter(match => 
          match.position >= range.min && match.position <= range.max
        ).length;
      }, 0);

      return {
        range: range.range,
        count,
        percentage: totalMatches > 0 ? (count / totalMatches) * 100 : 0
      };
    });
  }
}
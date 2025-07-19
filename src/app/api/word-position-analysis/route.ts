import { NextRequest, NextResponse } from 'next/server';
import { WordPositionAnalysisService, WordPositionAnalysisRequest } from '../../../services/WordPositionAnalysisService';
import { getUser } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.debug('📊 Word Position Analysis API - Starting request');

    // Check authentication
    const user = await getUser();
    if (!user?.email) {
      console.debug('❌ User not authenticated');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.debug(`✅ User authenticated: ${user.email}`);

    // Parse request body
    let body: WordPositionAnalysisRequest;
    try {
      body = await request.json();
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.businessName || !body.responses || !Array.isArray(body.responses)) {
      console.debug('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: businessName and responses array' },
        { status: 400 }
      );
    }

    if (body.responses.length === 0) {
      console.debug('❌ Empty responses array');
      return NextResponse.json(
        { error: 'Responses array cannot be empty' },
        { status: 400 }
      );
    }

    // Validate response objects
    for (const response of body.responses) {
      if (!response.id || !response.modelName || !response.responseText) {
        console.debug('❌ Invalid response object structure');
        return NextResponse.json(
          { error: 'Each response must have id, modelName, and responseText' },
          { status: 400 }
        );
      }
    }

    console.debug(`🔍 Analyzing ${body.responses.length} responses for business: "${body.businessName}"`);

    // Perform word position analysis
    const result = await WordPositionAnalysisService.analyzeWordPositions(body);

    console.debug(`✅ Word position analysis completed successfully`);
    console.debug(`📊 Results: ${result.totalMatches} matches across ${result.totalResponses} responses`);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('❌ Error in word position analysis:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during word position analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Word Position Analysis API',
      usage: 'POST with businessName and responses array',
      example: {
        businessName: 'SearchDogAI',
        responses: [
          {
            id: 'response-1',
            modelName: 'OpenAI',
            responseText: 'SearchDogAI is a leading platform for AEO analytics...',
            query: 'Top AEO analytics platforms'
          }
        ],
        variations: ['SearchDog AI', 'Search Dog AI'] // optional
      }
    },
    { status: 200 }
  );
}
import { NextRequest, NextResponse } from 'next/server';
import { AEOAnalysisService, type AnalysisRequest } from '../../../services/AEOAnalysisService';


export async function POST(request: NextRequest) {
  try {
    const requestData: AnalysisRequest = await request.json();
    const result = await AEOAnalysisService.runAnalysis(requestData);
    console.log("AEO Score API: ", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ AEO Score API error:', error);
    
    // Handle specific error types with appropriate status codes
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Daily limit reached') || error.message.includes('Usage limit exceeded')) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }
      if (error.message.includes('Missing required fields')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze AEO scores' },
      { status: 500 }
    );
  }
}
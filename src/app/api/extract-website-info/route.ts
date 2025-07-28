import { NextRequest, NextResponse } from 'next/server';
import { WebsiteInfoExtractionService, type WebsiteExtractionRequest } from '../../../services/WebsiteInfoExtractionService';
import { getUser } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestData: WebsiteExtractionRequest = await request.json();
    
    if (!requestData.url) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(requestData.url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log("Website Info Extraction API: ", requestData.url);
    
    const result = await WebsiteInfoExtractionService.extractBusinessInfo(requestData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Website Info Extraction API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return NextResponse.json({ 
          error: 'Unable to access the website. Please check the URL and try again.' 
        }, { status: 400 });
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Website took too long to respond. Please try again.' 
        }, { status: 408 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to extract website information. Please try entering the details manually.' },
      { status: 500 }
    );
  }
}
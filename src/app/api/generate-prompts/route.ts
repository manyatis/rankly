import { NextRequest, NextResponse } from 'next/server';
import { PromptFormationService } from '../../../services/PromptFormationService';
import { AEOAnalysisService } from '../../../services/AEOAnalysisService';
import { getUser, checkRateLimit, incrementRateLimit } from '../../../lib/auth';

interface GeneratePromptsRequest {
  businessName: string;
  industry: string;
  location?: string;
  marketDescription: string;
  keywords: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check rate limit for generate prompts
    const rateLimitCheck = await checkRateLimit(user.email, 'generatePrompts');
    if (!rateLimitCheck.canUse) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded', 
        waitMinutes: rateLimitCheck.waitMinutes,
        message: `You're doing that too frequently. Try again in ${rateLimitCheck.waitMinutes} minute${rateLimitCheck.waitMinutes !== 1 ? 's' : ''}.`
      }, { status: 429 });
    }

    // Validate daily usage limit
    const authResult = await AEOAnalysisService.validateAuthAndUsage();
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.statusCode || 401 }
      );
    }

    const requestData: GeneratePromptsRequest = await request.json();
    
    // Validate required fields
    const missingFields = [];
    if (!requestData.businessName) missingFields.push('businessName');
    if (!requestData.industry) missingFields.push('industry');
    if (!requestData.marketDescription) missingFields.push('marketDescription');
    if (!requestData.keywords) missingFields.push('keywords');
    else if (!Array.isArray(requestData.keywords)) missingFields.push('keywords (must be array)');
    else if (requestData.keywords.length === 0) missingFields.push('keywords (must be non-empty)');
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing or invalid fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    console.debug(`🧠 Generating prompts for ${requestData.businessName} in ${requestData.industry}`);

    // Generate optimized prompts using the PromptFormationService
    const promptFormationService = new PromptFormationService();
    const promptResult = await promptFormationService.generateOptimizedPrompts({
      businessName: requestData.businessName,
      industry: requestData.industry,
      location: requestData.location,
      marketDescription: requestData.marketDescription,
      keywords: requestData.keywords
    }, 4); // Generate 4 prompts for editing

    console.debug(`✅ Generated ${promptResult.queries.length} prompts`);

    // Increment rate limit counter on successful request
    await incrementRateLimit(user.email, 'generatePrompts');

    return NextResponse.json({
      prompts: promptResult.queries,
      usageInfo: authResult.usageInfo
    });

  } catch (error) {
    console.error('❌ Generate Prompts API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Daily limit reached') || error.message.includes('Usage limit exceeded')) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate prompts' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { AEOAnalysisService } from '../../../../services/AEOAnalysisService';

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 });
    }

    // Verify user has access to this business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { 
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!business || !business.organizations.some(org => org.organization.id === user.organizationId)) {
      return NextResponse.json({ error: 'Access denied to business' }, { status: 403 });
    }

    // Get the most recent prompts and keywords from InputHistory
    const recentInput = await prisma.inputHistory.findFirst({
      where: {
        businessId: businessId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        keywords: true,
        prompts: true
      }
    });

    // Use stored business info and recent prompts, or generate new ones if none exist
    const analysisRequest = {
      businessId: business.id,
      businessName: business.websiteName,
      industry: business.industry || 'Technology',
      location: business.useLocationInAnalysis && business.location ? business.location : '', // Conditionally include location
      marketDescription: business.description || `Business website at ${business.websiteUrl}`,
      keywords: recentInput?.keywords || [business.websiteName, 'business', 'services'],
      websiteUrl: business.websiteUrl || undefined,
      providers: [
        { name: 'OpenAI GPT-4', model: 'gpt-4', color: '#10B981', type: 'openai' as const },
        { name: 'Claude 3.5 Sonnet', model: 'claude-3-5-sonnet-20241022', color: '#8B5CF6', type: 'anthropic' as const },
        { name: 'Perplexity Pro', model: 'llama-3.1-sonar-large-128k-online', color: '#F59E0B', type: 'perplexity' as const }
      ],
      customPrompts: recentInput?.prompts || undefined
    };

    console.log(`🚀 Executing analysis for ${business.websiteName} using stored data...`);
    const analysisResult = await AEOAnalysisService.runAnalysis(analysisRequest);

    return NextResponse.json({
      success: true,
      message: `Analysis completed for ${business.websiteName}`,
      business: {
        id: business.id,
        name: business.websiteName,
        url: business.websiteUrl,
        industry: business.industry,
        location: business.location,
        description: business.description
      },
      usedStoredData: {
        keywords: recentInput?.keywords ? 'Used stored keywords' : 'Generated default keywords',
        prompts: recentInput?.prompts ? 'Used stored prompts' : 'Generated new prompts'
      },
      analysisResult
    });

  } catch (error) {
    console.error('❌ Execute analysis error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Usage limit')) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to execute analysis', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
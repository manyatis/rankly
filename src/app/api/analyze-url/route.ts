import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/nextauth';
import { WebsiteAnalysisService } from '../../../services/WebsiteAnalysisService';
import { AEOAnalysisService } from '../../../services/AEOAnalysisService';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { websiteUrl } = await request.json();

    if (!websiteUrl) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log(`📊 Starting URL-based analysis for: ${websiteUrl}`);

    // Step 1: Extract business information from the website
    const businessInfo = await WebsiteAnalysisService.extractBusinessInfo(websiteUrl);
    console.log(`🏢 Extracted business info:`, businessInfo);

    // Step 2: Check if business already exists by URL
    let business = await prisma.business.findFirst({
      where: { websiteUrl: websiteUrl }
    });

    if (!business) {
      // Step 3: Create new business with extracted information
      console.log(`➕ Creating new business: ${businessInfo.businessName}`);
      business = await prisma.business.create({
        data: {
          websiteName: businessInfo.businessName,
          websiteUrl: websiteUrl,
          industry: businessInfo.industry,
          location: businessInfo.location,
          description: businessInfo.description,
          isCompetitor: false,
          userId: null, // URL-driven businesses are user agnostic initially
        }
      });
      console.log(`✅ Created business with ID: ${business.id}`);
    } else {
      console.log(`♻️ Found existing business: ${business.websiteName} (ID: ${business.id})`);
    }

    // Step 4: Link business to user's organization if not already linked
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 });
    }

    // Check if business is already linked to this organization
    const existingLink = await prisma.organizationBusiness.findUnique({
      where: {
        organizationId_businessId: {
          organizationId: user.organizationId,
          businessId: business.id
        }
      }
    });

    if (!existingLink) {
      // Link business to organization
      await prisma.organizationBusiness.create({
        data: {
          organizationId: user.organizationId,
          businessId: business.id,
          role: 'owner'
        }
      });
      console.log(`🔗 Linked business to organization ${user.organizationId}`);
    }

    // Step 5: Run AEO analysis with auto-generated information
    const analysisRequest = {
      businessId: business.id,
      businessName: businessInfo.businessName,
      industry: businessInfo.industry,
      location: business.useLocationInAnalysis && businessInfo.location ? businessInfo.location : '', // Conditionally include location
      marketDescription: businessInfo.description,
      keywords: businessInfo.keywords,
      websiteUrl: websiteUrl,
      providers: [
        { name: 'OpenAI GPT-4', model: 'gpt-4', color: '#10B981', type: 'openai' as const },
        { name: 'Claude 3.5 Sonnet', model: 'claude-3-5-sonnet-20241022', color: '#8B5CF6', type: 'anthropic' as const },
        { name: 'Perplexity Pro', model: 'llama-3.1-sonar-large-128k-online', color: '#F59E0B', type: 'perplexity' as const }
      ],
      customPrompts: undefined
    };

    console.log(`🚀 Starting AEO analysis for ${businessInfo.businessName}...`);
    const analysisResult = await AEOAnalysisService.runAnalysis(analysisRequest);

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.websiteName,
        url: business.websiteUrl,
        industry: business.industry,
        location: business.location,
        description: business.description
      },
      extractedInfo: businessInfo,
      analysisResult
    });

  } catch (error) {
    console.error('❌ URL analysis error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Usage limit')) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to analyze URL', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
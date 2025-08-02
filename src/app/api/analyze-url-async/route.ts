import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/nextauth';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { websiteUrl } = await request.json();

    if (!websiteUrl) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    // Validate URL format
    let normalizedUrl = websiteUrl;
    try {
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user and organization info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 });
    }

    // Check rate limits
    const websiteLimitInfo = await checkWebsiteLimits(user.id);
    if (!websiteLimitInfo.canAddWebsite) {
      return NextResponse.json({ 
        error: `Website limit reached. You have ${websiteLimitInfo.currentCount}/${websiteLimitInfo.limit} websites.`,
        websiteLimitInfo
      }, { status: 429 });
    }

    // Create the analysis job
    const job = await prisma.analysisJob.create({
      data: {
        websiteUrl: normalizedUrl,
        userId: user.id,
        organizationId: user.organizationId,
        status: 'pending',
        progressPercent: 0,
        progressMessage: 'Analysis job created'
      }
    });

    console.log(`📊 Created analysis job ${job.id} for URL: ${normalizedUrl}`);

    // Start processing the job asynchronously
    processAnalysisJob(job.id).catch(error => {
      console.error(`❌ Error processing job ${job.id}:`, error);
    });

    return NextResponse.json({
      jobId: job.id,
      status: 'pending',
      message: 'Analysis job created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating analysis job:', error);
    return NextResponse.json({ 
      error: 'Failed to create analysis job', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Check job status endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const job = await prisma.analysisJob.findFirst({
      where: {
        id: jobId,
        userId: user.id
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // If job is completed, include the business info
    let business = null;
    if (job.status === 'completed' && job.businessId) {
      business = await prisma.business.findUnique({
        where: { id: job.businessId },
        select: {
          id: true,
          websiteName: true,
          websiteUrl: true,
          industry: true,
          location: true,
          description: true
        }
      });
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progressPercent: job.progressPercent,
      progressMessage: job.progressMessage,
      error: job.error,
      business: business,
      extractedInfo: job.extractedInfo,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    });

  } catch (error) {
    console.error('❌ Error checking job status:', error);
    return NextResponse.json({ 
      error: 'Failed to check job status', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

async function checkWebsiteLimits(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      organizationId: true
    }
  });

  if (!user?.organizationId) {
    return { canAddWebsite: false, currentCount: 0, limit: 0, tier: 'free' };
  }

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { websiteCount: true }
  });

  const currentCount = organization?.websiteCount || 0;

  // Define limits per tier
  const limits: Record<string, number> = {
    free: 1,
    indie: 3,
    professional: 999,
    enterprise: 999
  };

  const limit = limits[user.subscriptionTier] || limits.free;
  const isUnlimited = limit >= 999;

  return {
    canAddWebsite: currentCount < limit,
    currentCount,
    limit: isUnlimited ? 0 : limit,
    remainingSlots: isUnlimited ? null : Math.max(0, limit - currentCount),
    tier: user.subscriptionTier,
    isUnlimited
  };
}

// Background job processor
async function processAnalysisJob(jobId: string) {
  try {
    // Import services dynamically to avoid circular dependencies
    const { WebsiteAnalysisService } = await import('../../../services/WebsiteAnalysisService');
    const { AEOAnalysisService } = await import('../../../services/AEOAnalysisService');

    // Update job status to processing
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'processing',
        progressPercent: 5,
        progressMessage: 'Starting website analysis...'
      }
    });

    const job = await prisma.analysisJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Step 1: Extract business information
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        progressPercent: 15,
        progressMessage: 'Extracting website content...'
      }
    });

    const businessInfo = await WebsiteAnalysisService.extractBusinessInfo(job.websiteUrl);

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        progressPercent: 30,
        progressMessage: 'AI analyzing business information...',
        extractedInfo: businessInfo as object
      }
    });

    // Step 2: Check if business already exists
    let business = await prisma.business.findFirst({
      where: { websiteUrl: job.websiteUrl }
    });

    if (!business) {
      // Create new business
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: {
          progressPercent: 45,
          progressMessage: 'Creating business profile...'
        }
      });

      business = await prisma.business.create({
        data: {
          websiteName: businessInfo.businessName,
          websiteUrl: job.websiteUrl,
          industry: businessInfo.industry,
          location: businessInfo.location,
          description: businessInfo.description,
          isCompetitor: false,
          userId: null
        }
      });
    }

    // Link business to organization
    const existingLink = await prisma.organizationBusiness.findUnique({
      where: {
        organizationId_businessId: {
          organizationId: job.organizationId,
          businessId: business.id
        }
      }
    });

    if (!existingLink) {
      await prisma.organizationBusiness.create({
        data: {
          organizationId: job.organizationId,
          businessId: business.id,
          role: 'owner'
        }
      });

      // Update organization website count
      await prisma.organization.update({
        where: { id: job.organizationId },
        data: {
          websiteCount: {
            increment: 1
          }
        }
      });
    }

    // Update job with business ID
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        businessId: business.id,
        progressPercent: 60,
        progressMessage: 'Generating AEO analysis prompts...'
      }
    });

    // Step 3: Run AEO analysis
    const analysisRequest = {
      businessId: business.id,
      businessName: businessInfo.businessName,
      industry: businessInfo.industry,
      location: business.useLocationInAnalysis && businessInfo.location ? businessInfo.location : '',
      marketDescription: businessInfo.description,
      keywords: businessInfo.keywords,
      websiteUrl: job.websiteUrl,
      providers: [
        { name: 'OpenAI GPT-4', model: 'gpt-4', color: '#10B981', type: 'openai' as const },
        { name: 'Claude 3.5 Sonnet', model: 'claude-3-5-sonnet-20241022', color: '#8B5CF6', type: 'anthropic' as const },
        { name: 'Perplexity Pro', model: 'llama-3.1-sonar-large-128k-online', color: '#F59E0B', type: 'perplexity' as const }
      ],
      customPrompts: undefined
    };

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        progressPercent: 75,
        progressMessage: 'Running queries across AI platforms...'
      }
    });

    const analysisResult = await AEOAnalysisService.runAnalysis(analysisRequest);

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        progressPercent: 90,
        progressMessage: 'Processing rankings and competitors...'
      }
    });

    // Complete the job
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        progressPercent: 100,
        progressMessage: 'Analysis complete!',
        analysisResult: analysisResult as object,
        completedAt: new Date()
      }
    });

    console.log(`✅ Job ${jobId} completed successfully`);

  } catch (error) {
    console.error(`❌ Error processing job ${jobId}:`, error);
    
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        completedAt: new Date()
      }
    });
  }
}
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

    // Create the analysis job with 'not-started' status
    const job = await prisma.analysisJob.create({
      data: {
        websiteUrl: normalizedUrl,
        userId: user.id,
        organizationId: user.organizationId,
        status: 'not-started',
        currentStep: 'not-started',
        progressPercent: 0,
        progressMessage: 'Analysis job created and queued for processing'
      }
    });

    console.log(`📊 Created analysis job ${job.id} for URL: ${normalizedUrl} with status: not-started`);

    // The job will be picked up by the cron processors
    // No need to process it here

    return NextResponse.json({
      jobId: job.id,
      status: 'not-started',
      message: 'Analysis job created successfully and queued for processing'
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
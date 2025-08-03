import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const data = await request.json();
    const { 
      businessId, 
      businessName, 
      industry, 
      location, 
      marketDescription, 
      keywords, 
      providers
    } = data;

    // Validate required fields
    if (!businessId || !businessName || !industry || !marketDescription || !keywords || !providers) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 });
    }

    // Get the website URL for the business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { websiteUrl: true }
    });

    if (!business || !business.websiteUrl) {
      return NextResponse.json({ error: 'Business website URL not found' }, { status: 400 });
    }

    // Create the analysis job with 'not-started' status
    const job = await prisma.analysisJob.create({
      data: {
        websiteUrl: business.websiteUrl,
        userId: user.id,
        organizationId: user.organizationId,
        businessId: businessId,
        status: 'not-started',
        currentStep: 'not-started',
        progressPercent: 0,
        progressMessage: 'Analysis job created and queued for processing',
        extractedInfo: {
          businessName,
          industry,
          location,
          description: marketDescription,
          keywords,
          isManualAnalysis: true
        },
        prompts: data.customPrompts ? { queries: data.customPrompts } : undefined
      }
    });

    console.log(`📊 Created manual analysis job ${job.id} for business ${businessId} with status: not-started`);

    // The job will be picked up by the cron processors
    // No need to process it here

    return NextResponse.json({
      jobId: job.id,
      status: 'not-started',
      message: 'Analysis job created successfully and queued for processing'
    });

  } catch (error) {
    console.error('❌ Error creating manual analysis job:', error);
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
    const businessId = searchParams.get('businessId');

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

    // If businessId is provided, return all jobs for that business
    if (businessId) {
      const jobs = await prisma.analysisJob.findMany({
        where: {
          businessId: parseInt(businessId),
          userId: user.id,
          extractedInfo: { path: ['isManualAnalysis'], equals: true } // Only manual analysis jobs
        },
        orderBy: { createdAt: 'desc' },
        take: 5 // Last 5 jobs
      });

      return NextResponse.json({
        jobs: jobs.map(job => ({
          jobId: job.id,
          status: job.status,
          progressPercent: job.progressPercent,
          progressMessage: job.progressMessage,
          error: job.error,
          analysisResult: job.analysisResult,
          createdAt: job.createdAt,
          completedAt: job.completedAt
        }))
      });
    }

    // If jobId is provided, return specific job
    if (jobId) {
      const job = await prisma.analysisJob.findFirst({
        where: {
          id: jobId,
          userId: user.id
        }
      });

      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      return NextResponse.json({
        jobId: job.id,
        status: job.status,
        progressPercent: job.progressPercent,
        progressMessage: job.progressMessage,
        error: job.error,
        analysisResult: job.analysisResult,
        createdAt: job.createdAt,
        completedAt: job.completedAt
      });
    }

    return NextResponse.json({ error: 'Job ID or Business ID is required' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error checking job status:', error);
    return NextResponse.json({ 
      error: 'Failed to check job status', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// The processManualAnalysisJob function is no longer needed since
// jobs are now processed by the staged cron processors
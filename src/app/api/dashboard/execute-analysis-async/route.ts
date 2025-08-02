import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '../../../../lib/prisma';
import type { ModelType } from '../../../../lib/ai-models';

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

    // Create the analysis job
    const job = await prisma.analysisJob.create({
      data: {
        websiteUrl: `manual-analysis-${businessId}`, // Use a special format for manual analysis
        userId: user.id,
        organizationId: user.organizationId,
        businessId: businessId,
        status: 'pending',
        progressPercent: 0,
        progressMessage: 'Analysis job created',
        extractedInfo: {
          businessName,
          industry,
          location,
          marketDescription,
          keywords,
          isManualAnalysis: true
        }
      }
    });

    console.log(`📊 Created manual analysis job ${job.id} for business ${businessId}`);

    // Start processing the job asynchronously
    processManualAnalysisJob(job.id, {
      businessId,
      businessName,
      industry,
      location,
      marketDescription,
      keywords,
      websiteUrl: data.websiteUrl,
      providers,
      customPrompts: data.customPrompts
    }).catch(error => {
      console.error(`❌ Error processing manual analysis job ${job.id}:`, error);
    });

    return NextResponse.json({
      jobId: job.id,
      status: 'pending',
      message: 'Analysis job created successfully'
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
          websiteUrl: { startsWith: 'manual-analysis-' } // Only manual analysis jobs
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

// Background job processor for manual analysis
interface ManualAnalysisRequest {
  businessId: number;
  businessName: string;
  industry: string;
  location?: string;
  marketDescription: string;
  keywords: string[];
  websiteUrl?: string;
  providers: Array<{
    name: string;
    model: string;
    color: string;
    type: ModelType;
  }>;
  customPrompts?: string[];
}

async function processManualAnalysisJob(jobId: string, analysisRequest: ManualAnalysisRequest) {
  try {
    // Import services dynamically to avoid circular dependencies
    const { AEOAnalysisService } = await import('../../../../services/AEOAnalysisService');

    // Update job status to processing
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'processing',
        progressPercent: 10,
        progressMessage: 'Starting manual analysis...'
      }
    });

    // Progress updates throughout the analysis
    const progressSteps = [
      { percent: 20, message: 'Generating optimized prompts...' },
      { percent: 40, message: 'Running queries across AI platforms...' },
      { percent: 60, message: 'Analyzing ChatGPT responses...' },
      { percent: 70, message: 'Analyzing Claude responses...' },
      { percent: 80, message: 'Analyzing Perplexity responses...' },
      { percent: 90, message: 'Processing rankings and competitors...' }
    ];

    let currentStep = 0;
    const updateProgress = async () => {
      if (currentStep < progressSteps.length) {
        const step = progressSteps[currentStep];
        await prisma.analysisJob.update({
          where: { id: jobId },
          data: {
            progressPercent: step.percent,
            progressMessage: step.message
          }
        });
        currentStep++;
      }
    };

    // Set up progress interval
    const progressInterval = setInterval(updateProgress, 3000);

    try {
      // Run the actual analysis
      const analysisResult = await AEOAnalysisService.runAnalysis(analysisRequest);

      // Clear the progress interval
      clearInterval(progressInterval);

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

      console.log(`✅ Manual analysis job ${jobId} completed successfully`);

    } catch (analysisError) {
      clearInterval(progressInterval);
      throw analysisError;
    }

  } catch (error) {
    console.error(`❌ Error processing manual analysis job ${jobId}:`, error);
    
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
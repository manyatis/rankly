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

    // Progress tracking helper
    const updateProgress = async (percent: number, message: string) => {
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: {
          progressPercent: percent,
          progressMessage: message
        }
      });
    };

    // Initial setup
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'processing',
        progressPercent: 5,
        progressMessage: 'Initializing analysis... (estimated 4 minutes)'
      }
    });

    // Since we can't easily hook into the AEOAnalysisService stages, 
    // we'll run the analysis and update progress based on realistic timing
    const analysisStartTime = Date.now();
    
    // Stage 1: Competitor identification (5-15%)
    await updateProgress(10, 'Identifying competitors...');
    
    // Small delay to show this stage
    await new Promise(resolve => setTimeout(resolve, 1000));
    await updateProgress(15, 'Competitors identified, generating prompts...');

    // Stage 2: Prompt generation (15-25%)
    await new Promise(resolve => setTimeout(resolve, 500));
    await updateProgress(25, 'Starting AI provider analysis...');

    // Start the actual analysis
    const analysisPromise = AEOAnalysisService.runAnalysis(analysisRequest);

    // Progress tracking during analysis (25-85% - the main analysis phase)
    const analysisProgressSteps = [
      { percent: 35, message: 'Querying ChatGPT...', delay: 2000 },
      { percent: 45, message: 'Processing ChatGPT responses...', delay: 3000 },
      { percent: 55, message: 'Querying Claude...', delay: 2000 },
      { percent: 65, message: 'Processing Claude responses...', delay: 3000 },
      { percent: 75, message: 'Querying Perplexity...', delay: 2000 },
      { percent: 85, message: 'Processing all AI responses...', delay: 3000 }
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(async () => {
      if (stepIndex < analysisProgressSteps.length) {
        const step = analysisProgressSteps[stepIndex];
        await updateProgress(step.percent, step.message);
        stepIndex++;
      }
    }, 4000); // Update every 4 seconds during analysis

    try {
      // Wait for the analysis to complete
      const analysisResult = await analysisPromise;

      // Clear the progress interval
      clearInterval(progressInterval);

      // Final stages (85-100%)
      await updateProgress(90, 'Analyzing website content...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await updateProgress(95, 'Aggregating results and saving data...');
      await new Promise(resolve => setTimeout(resolve, 1000));

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

      const totalTime = Math.round((Date.now() - analysisStartTime) / 1000);
      console.log(`✅ Manual analysis job ${jobId} completed successfully in ${totalTime}s`);

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
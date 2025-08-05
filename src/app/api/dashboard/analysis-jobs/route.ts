import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all analysis jobs for the user
    const jobs = await prisma.analysisJob.findMany({
      where: {
        userId: user.id,
        ...(includeCompleted ? {} : {
          status: { notIn: ['completed', 'failed'] }
        })
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Last 20 jobs
    });

    return NextResponse.json({
      jobs: jobs.map(job => ({
        id: job.id,
        websiteUrl: job.websiteUrl,
        businessId: job.businessId,
        status: job.status,
        currentStep: job.currentStep,
        progressPercent: job.progressPercent,
        progressMessage: job.progressMessage,
        error: job.error,
        extractedInfo: job.extractedInfo,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        isManualAnalysis: job.extractedInfo && 
          typeof job.extractedInfo === 'object' && 
          job.extractedInfo !== null && 
          'isManualAnalysis' in job.extractedInfo ? 
          job.extractedInfo.isManualAnalysis : false
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching analysis jobs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analysis jobs', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
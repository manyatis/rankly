import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Note: inProgress column is no longer used in the new pool-based system');
    console.log('🔧 This endpoint is kept for legacy compatibility');

    // Check if there are any jobs marked as inProgress (should be rare now)
    const stuckJobs = await prisma.analysisJob.findMany({
      where: {
        inProgress: true,
        status: { in: ['processing', 'not-started', 'prompt-forming', 'model-analysis'] }
      }
    });

    console.log(`📋 Found ${stuckJobs.length} jobs with inProgress=true`);

    if (stuckJobs.length > 0) {
      // Reset the inProgress flag for completeness (legacy cleanup)
      const result = await prisma.analysisJob.updateMany({
        where: {
          id: { in: stuckJobs.map(job => job.id) }
        },
        data: {
          inProgress: false,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Reset ${result.count} jobs (legacy cleanup)`);

      return NextResponse.json({
        success: true,
        message: `Reset ${result.count} legacy stuck jobs (inProgress column is deprecated)`,
        note: 'The new pool-based system uses in-memory queues, not database inProgress flags',
        jobs: stuckJobs.map(job => ({
          id: job.id,
          status: job.status,
          currentStep: job.currentStep,
          websiteUrl: job.websiteUrl,
          createdAt: job.createdAt
        }))
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'No jobs with inProgress=true found',
        note: 'The new pool-based system uses in-memory queues, not database inProgress flags',
        jobs: []
      });
    }

  } catch (error) {
    console.error('❌ Error checking stuck jobs:', error);
    return NextResponse.json({
      error: 'Failed to check stuck jobs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
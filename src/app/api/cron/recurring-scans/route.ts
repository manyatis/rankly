import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SubscriptionTiers } from '@/lib/subscription-tiers';

// Vercel cron job to run recurring scans
export async function GET(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    console.log('🔄 Starting recurring scans cron job...');
    
    const now = new Date();
    
    // Find all businesses that need scanning
    const businessesToScan = await prisma.business.findMany({
      where: {
        recurringScans: true,
        OR: [
          { nextScanDate: null }, // Never been scanned
          { nextScanDate: { lte: now } } // Scan is due
        ]
      },
      include: {
        user: {
          select: {
            email: true,
            plan: true,
            id: true
          }
        },
        organizations: {
          include: {
            organization: {
              include: {
                users: {
                  select: {
                    email: true,
                    plan: true,
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log(`📊 Found ${businessesToScan.length} businesses due for scanning`);

    let scannedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const business of businessesToScan) {
      try {
        console.log(`🔍 Processing business: ${business.websiteName} (ID: ${business.id})`);

        // Get the primary user (business owner or first organization user)
        let primaryUser = business.user;
        if (!primaryUser && business.organizations.length > 0) {
          primaryUser = business.organizations[0].organization.users[0];
        }

        if (!primaryUser) {
          console.warn(`⚠️ No user found for business ${business.id}, skipping`);
          continue;
        }

        // Check if user's tier supports recurring scans
        const hasRecurringScans = SubscriptionTiers.hasFeature(primaryUser.plan, 'recurring_scans');
        if (!hasRecurringScans) {
          console.debug(`⚠️ User ${primaryUser.email} (${primaryUser.plan}) does not have recurring scans feature, disabling for business ${business.id}`);
          
          // Disable recurring scans for this business
          await prisma.business.update({
            where: { id: business.id },
            data: { 
              recurringScans: false,
              nextScanDate: null
            }
          });
          continue;
        }

        // Get most recent keywords and prompts for this business
        const recentInput = await prisma.inputHistory.findFirst({
          where: { businessId: business.id },
          orderBy: { createdAt: 'desc' },
          select: {
            keywords: true,
            prompts: true
          }
        });

        console.log(`🚀 Creating background job for ${business.websiteName}...`);

        // Create an analysis job as 'not-started' - the BackgroundTaskManager will process it
        const job = await prisma.analysisJob.create({
          data: {
            websiteUrl: business.websiteUrl || `https://${business.websiteName}`,
            userId: primaryUser.id,
            organizationId: business.organizations[0]?.organizationId || 0,
            businessId: business.id,
            status: 'not-started',
            currentStep: 'not-started',
            progressPercent: 0,
            progressMessage: 'Queued for recurring scan...',
            inProgress: false,
            retryCount: 0,
            extractedInfo: {
              businessName: business.websiteName,
              industry: business.industry,
              location: business.location,
              description: business.description,
              keywords: recentInput?.keywords || [],
              isRecurringScan: true,
              scanFrequency: business.scanFrequency,
              isManualAnalysis: true // Skip website extraction since we already have business data
            },
            prompts: recentInput?.prompts ? { queries: recentInput.prompts } : undefined
          }
        });

        console.log(`✅ Created background job ${job.id} for ${business.websiteName}`);

        // Calculate next scan date based on frequency
        const nextScanDate = calculateNextScanDate(business.scanFrequency || 'weekly');

        // Update business scan tracking
        await prisma.business.update({
          where: { id: business.id },
          data: {
            lastScanDate: now,
            nextScanDate: nextScanDate
          }
        });

        scannedCount++;
        results.push({
          businessId: business.id,
          businessName: business.websiteName,
          status: 'queued',
          jobId: job.id,
          nextScanDate: nextScanDate.toISOString()
        });

        console.log(`✅ Successfully queued ${business.websiteName} for background processing, next scan: ${nextScanDate.toISOString()}`);

      } catch (error) {
        console.error(`❌ Error scanning business ${business.id}:`, error);
        errorCount++;
        
        results.push({
          businessId: business.id,
          businessName: business.websiteName,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Still update last scan date to prevent constant retries
        await prisma.business.update({
          where: { id: business.id },
          data: {
            lastScanDate: now,
            nextScanDate: calculateNextScanDate(business.scanFrequency || 'weekly')
          }
        });
      }
    }

    console.log(`🏁 Recurring scans completed: ${scannedCount} jobs queued, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      summary: {
        totalBusinesses: businessesToScan.length,
        jobsQueued: scannedCount,
        errors: errorCount,
        timestamp: now.toISOString(),
        message: 'Jobs queued for background processing'
      },
      results
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

/**
 * Calculate next scan date based on frequency
 */
function calculateNextScanDate(frequency: string): Date {
  const now = new Date();
  
  switch (frequency.toLowerCase()) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to weekly
  }
}
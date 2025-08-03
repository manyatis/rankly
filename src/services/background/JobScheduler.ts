/**
 * Job scheduler that discovers new jobs from the database every minute
 * and adds them to the appropriate queues for processing
 */

import { prisma } from '@/lib/prisma';
import { JobQueue, JobPhase } from './JobQueue';
import { JsonValue } from '@prisma/client/runtime/library';

export class JobScheduler {
  private static instance: JobScheduler | null = null;
  private schedulerInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly scanInterval = 60000; // 1 minute
  private readonly cleanupInterval_ms = 300000; // 5 minutes
  private readonly maxRetries = 3;

  static getInstance(): JobScheduler {
    if (!JobScheduler.instance) {
      JobScheduler.instance = new JobScheduler();
    }
    return JobScheduler.instance;
  }

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Start the job scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Job scheduler is already running');
      return;
    }

    console.log('🕐 Starting job scheduler (scanning every 1 minute)...');
    this.isRunning = true;

    // Immediate scan on startup
    this.scanForJobs();

    // Schedule regular scans
    this.schedulerInterval = setInterval(() => {
      this.scanForJobs();
    }, this.scanInterval);

    // Schedule cleanup of stuck jobs
    this.cleanupInterval = setInterval(() => {
      this.cleanupStuckJobs();
    }, this.cleanupInterval_ms);

    console.log('✅ Job scheduler started successfully');
  }

  /**
   * Stop the job scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Job scheduler is not running');
      return;
    }

    console.log('🛑 Stopping job scheduler...');

    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.isRunning = false;
    console.log('✅ Job scheduler stopped');
  }

  /**
   * Scan for new jobs and add them to queues
   */
  private async scanForJobs(): Promise<void> {
    try {
      console.debug('🔍 Scanning for new jobs...');
      
      const jobQueue = JobQueue.getInstance();
      let totalJobsQueued = 0;

      // Scan for website analysis jobs (not-started)
      const websiteJobs = await this.findJobsForPhase('not-started', 'website-analysis');
      for (const job of websiteJobs) {
        const success = jobQueue.enqueue({
          jobId: job.id,
          phase: 'website-analysis',
          priority: this.calculateJobPriority(job),
          attempts: job.retryCount || 0
        });
        if (success) totalJobsQueued++;
      }

      // Scan for prompt forming jobs
      const promptJobs = await this.findJobsForPhase('prompt-forming', 'prompt-forming');
      for (const job of promptJobs) {
        const success = jobQueue.enqueue({
          jobId: job.id,
          phase: 'prompt-forming',
          priority: this.calculateJobPriority(job),
          attempts: job.retryCount || 0
        });
        if (success) totalJobsQueued++;
      }

      // Scan for model analysis jobs
      const analysisJobs = await this.findJobsForPhase('model-analysis', 'model-analysis');
      for (const job of analysisJobs) {
        const success = jobQueue.enqueue({
          jobId: job.id,
          phase: 'model-analysis',
          priority: this.calculateJobPriority(job),
          attempts: job.retryCount || 0
        });
        if (success) totalJobsQueued++;
      }

      if (totalJobsQueued > 0) {
        console.log(`📨 Queued ${totalJobsQueued} new jobs for processing`);
      } else {
        console.debug('📋 No new jobs found');
      }

      // Log queue stats
      const stats = jobQueue.getStats();
      console.debug('📊 Queue stats:', JSON.stringify(stats, null, 2));

    } catch (error) {
      console.error('❌ Error scanning for jobs:', error);
    }
  }

  /**
   * Find jobs for a specific phase that are ready for processing
   * Uses in-memory queue state to prevent duplicates instead of database locking
   */
  private async findJobsForPhase(status: string, phase: JobPhase): Promise<Array<{
    id: string;
    createdAt: Date;
    retryCount: number;
    extractedInfo: JsonValue;
  }>> {
    // Find available jobs (no inProgress check - rely on queue state instead)
    const availableJobs = await prisma.analysisJob.findMany({
      where: {
        status,
        currentStep: status,
        retryCount: { lt: this.maxRetries },
        // Only include jobs that haven't been updated recently (avoid rapid re-queuing)
        updatedAt: {
          lt: new Date(Date.now() - 10000) // 10 seconds ago (reduced from 30)
        }
      },
      select: {
        id: true,
        createdAt: true,
        retryCount: true,
        extractedInfo: true
      },
      orderBy: [
        { createdAt: 'asc' } // Process older jobs first
      ],
      take: 5 // Smaller batch size for more frequent processing
    });

    console.debug(`📋 Found ${availableJobs.length} candidate jobs for ${phase}`);

    // Filter out jobs that are already in queues or being processed
    const jobQueue = JobQueue.getInstance();
    const availableJobsNotInQueue = availableJobs.filter(job => {
      // Check if job is already queued in any phase
      const stats = jobQueue.getStats();
      const allQueues = jobQueue.getAllQueues();
      
      for (const [queuePhase, queue] of allQueues) {
        const jobInQueue = queue.find(queuedJob => queuedJob.jobId === job.id);
        if (jobInQueue) {
          console.debug(`📋 Job ${job.id} already queued in ${queuePhase}`);
          return false;
        }
      }

      // Check if job is currently being processed
      const processingJobs = jobQueue.getProcessingJobs();
      for (const [processorId, processingJob] of processingJobs) {
        if (processingJob.jobId === job.id) {
          console.debug(`🔄 Job ${job.id} already being processed by ${processorId}`);
          return false;
        }
      }

      return true;
    });

    console.debug(`📋 Filtered to ${availableJobsNotInQueue.length} jobs not in queues for ${phase}`);
    return availableJobsNotInQueue;
  }

  /**
   * Calculate job priority based on various factors
   */
  private calculateJobPriority(job: {
    createdAt: string | Date;
    retryCount: number;
    extractedInfo: JsonValue;
  }): number {
    let priority = 5; // Base priority

    // Higher priority for newer jobs
    const ageHours = (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60);
    if (ageHours < 1) priority += 3;
    else if (ageHours < 6) priority += 1;

    // Lower priority for jobs that have failed before
    priority -= job.retryCount;

    // Higher priority for recurring scans
    if (job.extractedInfo && typeof job.extractedInfo === 'object' && job.extractedInfo !== null) {
      const extractedInfo = job.extractedInfo as { isRecurringScan?: boolean; isManualAnalysis?: boolean };
      if (extractedInfo.isRecurringScan) {
        priority += 2;
      }
      if (extractedInfo.isManualAnalysis) {
        priority += 1;
      }
    }

    return Math.max(0, priority); // Ensure non-negative
  }

  /**
   * Cleanup jobs that have been stuck in processing for too long
   */
  private async cleanupStuckJobs(): Promise<void> {
    try {
      console.debug('🧹 Cleaning up stuck jobs...');

      // Only cleanup in-memory stuck jobs since we removed database inProgress locking
      const jobQueue = JobQueue.getInstance();
      const releasedCount = jobQueue.releaseStuckJobs(300000); // 5 minutes
      
      if (releasedCount > 0) {
        console.log(`🔄 Released ${releasedCount} stuck jobs from memory queues`);
      } else {
        console.debug('🧹 No stuck jobs found in memory queues');
      }

    } catch (error) {
      console.error('❌ Error cleaning up stuck jobs:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { running: boolean; nextScan: Date | null; stats: { scanInterval: string; cleanupInterval: string; maxRetries: number } } {
    return {
      running: this.isRunning,
      nextScan: this.schedulerInterval ? new Date(Date.now() + this.scanInterval) : null,
      stats: {
        scanInterval: this.scanInterval / 1000 + ' seconds',
        cleanupInterval: this.cleanupInterval_ms / 1000 + ' seconds',
        maxRetries: this.maxRetries
      }
    };
  }

  /**
   * Force a manual scan (useful for testing)
   */
  async forceScan(): Promise<void> {
    console.log('🔄 Force scanning for jobs...');
    await this.scanForJobs();
  }

  /**
   * Force cleanup of stuck jobs (useful for testing)
   */
  async forceCleanup(): Promise<void> {
    console.log('🧹 Force cleaning up stuck jobs...');
    await this.cleanupStuckJobs();
  }
}
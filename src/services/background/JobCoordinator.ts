/**
 * Job coordinator that manages job assignment from queues to processor pools
 * Acts as the central orchestrator for all background job processing
 */

import { JobQueue, JobPhase, QueuedJob } from './JobQueue';
import { ProcessorPool } from './ProcessorPool';
import { StagedAnalysisService } from '../StagedAnalysisService';

export class JobCoordinator {
  private static instance: JobCoordinator | null = null;
  private coordinatorInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly coordinatorInterval_ms = 5000; // Check every 5 seconds
  private readonly healthCheckInterval_ms = 30000; // Health check every 30 seconds

  static getInstance(): JobCoordinator {
    if (!JobCoordinator.instance) {
      JobCoordinator.instance = new JobCoordinator();
    }
    return JobCoordinator.instance;
  }

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Initialize and start the job coordinator
   */
  async initialize(): Promise<void> {
    console.log('🎯 Initializing job coordinator...');
    
    const processorPool = ProcessorPool.getInstance();
    
    // Register processor functions for each phase
    processorPool.registerProcessor('website-analysis', this.processWebsiteAnalysisJob.bind(this));
    processorPool.registerProcessor('prompt-forming', this.processPromptFormingJob.bind(this));
    processorPool.registerProcessor('model-analysis', this.processModelAnalysisJob.bind(this));
    
    console.log('✅ Job coordinator initialized with processor functions');
  }

  /**
   * Start the job coordinator
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Job coordinator is already running');
      return;
    }

    console.log('🎯 Starting job coordinator...');
    this.isRunning = true;

    // Start job assignment loop
    this.coordinatorInterval = setInterval(() => {
      this.assignJobs();
    }, this.coordinatorInterval_ms);

    // Start health check loop
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval_ms);

    console.log('✅ Job coordinator started successfully');
  }

  /**
   * Stop the job coordinator
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Job coordinator is not running');
      return;
    }

    console.log('🛑 Stopping job coordinator...');

    if (this.coordinatorInterval) {
      clearInterval(this.coordinatorInterval);
      this.coordinatorInterval = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.isRunning = false;
    console.log('✅ Job coordinator stopped');
  }

  /**
   * Main job assignment loop - assigns jobs from queues to available processors
   */
  private async assignJobs(): Promise<void> {
    try {
      const jobQueue = JobQueue.getInstance();
      const processorPool = ProcessorPool.getInstance();
      
      // Process each phase in order of priority
      const phases: JobPhase[] = ['website-analysis', 'prompt-forming', 'model-analysis'];
      
      for (const phase of phases) {
        let assignedCount = 0;
        const maxAssignmentsPerCycle = 3; // Limit assignments per cycle to prevent overwhelming
        
        // Keep assigning jobs while we have capacity (but limit per cycle)
        while (assignedCount < maxAssignmentsPerCycle) {
          const availableProcessor = processorPool.getAvailableProcessor(phase);
          if (!availableProcessor) {
            break; // No available processors for this phase
          }
          
          const job = jobQueue.dequeue(phase, availableProcessor.id);
          if (!job) {
            break; // No jobs in queue for this phase
          }
          
          const success = await processorPool.assignJob(phase, job);
          if (success) {
            assignedCount++;
          } else {
            // Assignment failed, release job back to queue
            jobQueue.releaseJob(availableProcessor.id, true);
          }
        }
        
        if (assignedCount > 0) {
          console.debug(`🎯 Assigned ${assignedCount} jobs for ${phase}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in job assignment:', error);
    }
  }

  /**
   * Perform health checks on the system
   */
  private performHealthCheck(): void {
    try {
      const jobQueue = JobQueue.getInstance();
      const processorPool = ProcessorPool.getInstance();
      
      // Check processor pool health
      const poolHealth = processorPool.healthCheck();
      if (!poolHealth.healthy) {
        console.warn('⚠️ Processor pool health issues:', poolHealth.issues);
      }
      
      // Reset stuck processors
      const resetCount = processorPool.resetStuckProcessors();
      if (resetCount > 0) {
        console.warn(`🔄 Reset ${resetCount} stuck processors`);
      }
      
      // Release stuck jobs from queues
      const releasedCount = jobQueue.releaseStuckJobs();
      if (releasedCount > 0) {
        console.warn(`🔄 Released ${releasedCount} stuck jobs from queues`);
      }
      
      // Log system status
      const queueStats = jobQueue.getStats();
      const poolStats = processorPool.getPoolStats();
      
      console.debug('💊 Health check completed');
      console.debug('📊 Queue stats:', JSON.stringify(queueStats, null, 2));
      console.debug('🏊 Pool stats:', JSON.stringify(poolStats, null, 2));
      
    } catch (error) {
      console.error('❌ Error in health check:', error);
    }
  }

  /**
   * Process website analysis job
   */
  private async processWebsiteAnalysisJob(queuedJob: QueuedJob): Promise<void> {
    console.debug(`🌐 Processing website analysis job ${queuedJob.jobId}`);
    
    try {
      await StagedAnalysisService.processNotStartedJobById(queuedJob.jobId);
      
      // Mark job as completed in queue
      const jobQueue = JobQueue.getInstance();
      const processingJobs = jobQueue.getProcessingJobs();
      
      for (const [processorId, job] of processingJobs) {
        if (job.jobId === queuedJob.jobId) {
          jobQueue.completeJob(processorId, true);
          break;
        }
      }
      
      console.debug(`✅ Website analysis job ${queuedJob.jobId} completed`);
      
    } catch (error) {
      console.error(`❌ Website analysis job ${queuedJob.jobId} failed:`, error);
      
      // Mark job as failed in queue
      const jobQueue = JobQueue.getInstance();
      const processingJobs = jobQueue.getProcessingJobs();
      
      for (const [processorId, job] of processingJobs) {
        if (job.jobId === queuedJob.jobId) {
          jobQueue.completeJob(processorId, false);
          break;
        }
      }
      
      throw error;
    }
  }

  /**
   * Process prompt forming job
   */
  private async processPromptFormingJob(queuedJob: QueuedJob): Promise<void> {
    console.debug(`🧠 Processing prompt forming job ${queuedJob.jobId}`);
    
    try {
      await StagedAnalysisService.processPromptFormingJobById(queuedJob.jobId);
      
      // Mark job as completed in queue
      const jobQueue = JobQueue.getInstance();
      const processingJobs = jobQueue.getProcessingJobs();
      
      for (const [processorId, job] of processingJobs) {
        if (job.jobId === queuedJob.jobId) {
          jobQueue.completeJob(processorId, true);
          break;
        }
      }
      
      console.debug(`✅ Prompt forming job ${queuedJob.jobId} completed`);
      
    } catch (error) {
      console.error(`❌ Prompt forming job ${queuedJob.jobId} failed:`, error);
      
      // Mark job as failed in queue
      const jobQueue = JobQueue.getInstance();
      const processingJobs = jobQueue.getProcessingJobs();
      
      for (const [processorId, job] of processingJobs) {
        if (job.jobId === queuedJob.jobId) {
          jobQueue.completeJob(processorId, false);
          break;
        }
      }
      
      throw error;
    }
  }

  /**
   * Process model analysis job
   */
  private async processModelAnalysisJob(queuedJob: QueuedJob): Promise<void> {
    console.debug(`🤖 Processing model analysis job ${queuedJob.jobId}`);
    
    try {
      await StagedAnalysisService.processModelAnalysisJobById(queuedJob.jobId);
      
      // Mark job as completed in queue
      const jobQueue = JobQueue.getInstance();
      const processingJobs = jobQueue.getProcessingJobs();
      
      for (const [processorId, job] of processingJobs) {
        if (job.jobId === queuedJob.jobId) {
          jobQueue.completeJob(processorId, true);
          break;
        }
      }
      
      console.debug(`✅ Model analysis job ${queuedJob.jobId} completed`);
      
    } catch (error) {
      console.error(`❌ Model analysis job ${queuedJob.jobId} failed:`, error);
      
      // Mark job as failed in queue
      const jobQueue = JobQueue.getInstance();
      const processingJobs = jobQueue.getProcessingJobs();
      
      for (const [processorId, job] of processingJobs) {
        if (job.jobId === queuedJob.jobId) {
          jobQueue.completeJob(processorId, false);
          break;
        }
      }
      
      throw error;
    }
  }

  /**
   * Get coordinator status and statistics
   */
  getStatus(): {
    running: boolean;
    systemHealth: { healthy: boolean; issues: string[] };
    queueStats: Record<string, { queued: number; processing: number }>;
    poolStats: Record<string, { idle: number; busy: number; error: number; total: number }>;
    capacity: Record<string, number>;
  } {
    const jobQueue = JobQueue.getInstance();
    const processorPool = ProcessorPool.getInstance();
    
    return {
      running: this.isRunning,
      systemHealth: processorPool.healthCheck(),
      queueStats: jobQueue.getStats(),
      poolStats: processorPool.getPoolStats(),
      capacity: processorPool.getCapacity()
    };
  }

  /**
   * Emergency system reset
   */
  emergencyReset(): void {
    console.warn('🚨 Performing emergency system reset...');
    
    const jobQueue = JobQueue.getInstance();
    const processorPool = ProcessorPool.getInstance();
    
    // Reset all processors
    processorPool.restartAllProcessors();
    
    // Clear all queues (jobs will be rediscovered by scheduler)
    jobQueue.clearAll();
    
    console.log('✅ Emergency reset completed');
  }
}
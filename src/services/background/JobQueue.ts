/**
 * Thread-safe job queue system for background processing
 * Each processing phase has its own queue
 */

export interface QueuedJob {
  id: number;
  jobId: string;
  phase: JobPhase;
  priority: number;
  queuedAt: Date;
  attempts: number;
}

export type JobPhase = 'website-analysis' | 'prompt-forming' | 'model-analysis';

export class JobQueue {
  private static instance: JobQueue | null = null;
  private queues: Map<JobPhase, QueuedJob[]> = new Map();
  private processingJobs: Map<string, QueuedJob> = new Map(); // processorId -> job
  private readonly maxQueueSize = 1000;

  static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  private constructor() {
    // Initialize queues for each phase
    this.queues.set('website-analysis', []);
    this.queues.set('prompt-forming', []);
    this.queues.set('model-analysis', []);
  }

  /**
   * Add a job to the appropriate queue
   */
  enqueue(job: Omit<QueuedJob, 'id' | 'queuedAt'>): boolean {
    const queue = this.queues.get(job.phase);
    if (!queue) {
      console.error(`❌ Invalid job phase: ${job.phase}`);
      return false;
    }

    if (queue.length >= this.maxQueueSize) {
      console.warn(`⚠️ Queue for ${job.phase} is full (${this.maxQueueSize} jobs)`);
      return false;
    }

    // Check if job is already queued in this phase
    const existingJob = queue.find(q => q.jobId === job.jobId);
    if (existingJob) {
      console.debug(`📋 Job ${job.jobId} already queued for ${job.phase}`);
      return false;
    }

    // Check if job is already being processed by any processor
    const processingJob = Array.from(this.processingJobs.values()).find(j => j.jobId === job.jobId);
    if (processingJob) {
      console.debug(`🔄 Job ${job.jobId} already being processed`);
      return false;
    }

    // Check if job is queued in any other phase (shouldn't happen but safety check)
    for (const [otherPhase, otherQueue] of this.queues) {
      if (otherPhase !== job.phase) {
        const jobInOtherPhase = otherQueue.find(q => q.jobId === job.jobId);
        if (jobInOtherPhase) {
          console.debug(`⚠️ Job ${job.jobId} already queued in ${otherPhase} phase`);
          return false;
        }
      }
    }

    const queuedJob: QueuedJob = {
      ...job,
      id: Date.now() + Math.random(), // Simple unique ID
      queuedAt: new Date()
    };

    // Insert job in priority order (higher priority first)
    const insertIndex = queue.findIndex(q => q.priority < job.priority);
    if (insertIndex === -1) {
      queue.push(queuedJob);
    } else {
      queue.splice(insertIndex, 0, queuedJob);
    }

    console.debug(`📨 Queued job ${job.jobId} for ${job.phase} (queue size: ${queue.length})`);
    return true;
  }

  /**
   * Get the next job from a specific queue for processing
   */
  dequeue(phase: JobPhase, processorId: string): QueuedJob | null {
    const queue = this.queues.get(phase);
    if (!queue || queue.length === 0) {
      return null;
    }

    // Check if this processor is already processing a job
    if (this.processingJobs.has(processorId)) {
      console.warn(`⚠️ Processor ${processorId} is already processing a job`);
      return null;
    }

    const job = queue.shift();
    if (job) {
      this.processingJobs.set(processorId, job);
      console.debug(`🔄 Dequeued job ${job.jobId} for processor ${processorId} (${phase})`);
    }

    return job || null;
  }

  /**
   * Mark a job as completed by a processor
   */
  completeJob(processorId: string, success: boolean = true): void {
    const job = this.processingJobs.get(processorId);
    if (job) {
      this.processingJobs.delete(processorId);
      console.debug(`✅ Job ${job.jobId} ${success ? 'completed' : 'failed'} by processor ${processorId}`);
    }
  }

  /**
   * Release a job back to the queue (for retries)
   */
  releaseJob(processorId: string, retry: boolean = true): void {
    const job = this.processingJobs.get(processorId);
    if (job) {
      this.processingJobs.delete(processorId);
      
      if (retry && job.attempts < 3) {
        // Re-queue with lower priority and incremented attempts
        const retryJob = {
          ...job,
          priority: Math.max(0, job.priority - 1),
          attempts: job.attempts + 1
        };
        this.enqueue(retryJob);
        console.debug(`🔄 Released job ${job.jobId} back to queue for retry (attempt ${retryJob.attempts})`);
      } else {
        console.debug(`❌ Job ${job.jobId} max retries reached or not retrying`);
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): Record<JobPhase, { queued: number; processing: number }> {
    const stats = {} as Record<JobPhase, { queued: number; processing: number }>;
    
    for (const [phase, queue] of this.queues) {
      const processing = Array.from(this.processingJobs.values()).filter(job => job.phase === phase).length;
      stats[phase] = {
        queued: queue.length,
        processing
      };
    }
    
    return stats;
  }

  /**
   * Get jobs currently being processed
   */
  getProcessingJobs(): Map<string, QueuedJob> {
    return new Map(this.processingJobs);
  }

  /**
   * Get all queues (for checking if job exists in any queue)
   */
  getAllQueues(): Map<JobPhase, QueuedJob[]> {
    return new Map(this.queues);
  }

  /**
   * Force release stuck jobs (cleanup for processors that died)
   */
  releaseStuckJobs(maxProcessingTime: number = 300000): number { // 5 minutes default
    let releasedCount = 0;
    const now = new Date();
    
    for (const [processorId, job] of this.processingJobs) {
      const processingTime = now.getTime() - job.queuedAt.getTime();
      if (processingTime > maxProcessingTime) {
        console.warn(`⚠️ Releasing stuck job ${job.jobId} from processor ${processorId} (processing for ${Math.round(processingTime/1000)}s)`);
        this.releaseJob(processorId, true);
        releasedCount++;
      }
    }
    
    return releasedCount;
  }

  /**
   * Clear all queues (for testing)
   */
  clearAll(): void {
    this.queues.forEach(queue => queue.length = 0);
    this.processingJobs.clear();
    console.log('🧹 All job queues cleared');
  }
}
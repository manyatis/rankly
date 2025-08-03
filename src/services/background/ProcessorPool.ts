/**
 * Processor pool system for handling multiple concurrent job processors
 * Each phase has a pool of 10 processors
 */

import { JobPhase, QueuedJob } from './JobQueue';

export interface Processor {
  id: string;
  phase: JobPhase;
  status: 'idle' | 'busy' | 'error';
  currentJob: QueuedJob | null;
  startedAt: Date | null;
  completedJobs: number;
  errorCount: number;
}

export type ProcessorFunction = (job: QueuedJob) => Promise<void>;

export class ProcessorPool {
  private static instance: ProcessorPool | null = null;
  private pools: Map<JobPhase, Processor[]> = new Map();
  private processorFunctions: Map<JobPhase, ProcessorFunction> = new Map();
  private readonly poolSize = 10;

  static getInstance(): ProcessorPool {
    if (!ProcessorPool.instance) {
      ProcessorPool.instance = new ProcessorPool();
    }
    return ProcessorPool.instance;
  }

  private constructor() {
    // Initialize processor pools for each phase
    this.initializePool('website-analysis');
    this.initializePool('prompt-forming');
    this.initializePool('model-analysis');
  }

  /**
   * Initialize a processor pool for a specific phase
   */
  private initializePool(phase: JobPhase): void {
    const processors: Processor[] = [];
    
    for (let i = 0; i < this.poolSize; i++) {
      processors.push({
        id: `${phase}-processor-${i + 1}`,
        phase,
        status: 'idle',
        currentJob: null,
        startedAt: null,
        completedJobs: 0,
        errorCount: 0
      });
    }
    
    this.pools.set(phase, processors);
    console.debug(`🏊 Initialized pool for ${phase} with ${this.poolSize} processors`);
  }

  /**
   * Register a processor function for a specific phase
   */
  registerProcessor(phase: JobPhase, processorFunction: ProcessorFunction): void {
    this.processorFunctions.set(phase, processorFunction);
    console.debug(`📝 Registered processor function for ${phase}`);
  }

  /**
   * Get an available processor from the pool for a specific phase
   */
  getAvailableProcessor(phase: JobPhase): Processor | null {
    const pool = this.pools.get(phase);
    if (!pool) {
      console.error(`❌ No pool found for phase: ${phase}`);
      return null;
    }

    return pool.find(processor => processor.status === 'idle') || null;
  }

  /**
   * Assign a job to an available processor
   */
  async assignJob(phase: JobPhase, job: QueuedJob): Promise<boolean> {
    const processor = this.getAvailableProcessor(phase);
    if (!processor) {
      console.debug(`⏳ No available processors for ${phase} (job ${job.jobId} waiting)`);
      return false;
    }

    const processorFunction = this.processorFunctions.get(phase);
    if (!processorFunction) {
      console.error(`❌ No processor function registered for phase: ${phase}`);
      return false;
    }

    // Mark processor as busy
    processor.status = 'busy';
    processor.currentJob = job;
    processor.startedAt = new Date();

    console.debug(`🔄 Assigned job ${job.jobId} to processor ${processor.id}`);

    // Process the job asynchronously
    this.processJobAsync(processor, processorFunction, job);
    
    return true;
  }

  /**
   * Process a job asynchronously
   */
  private async processJobAsync(processor: Processor, processorFunction: ProcessorFunction, job: QueuedJob): Promise<void> {
    try {
      console.debug(`🚀 Processor ${processor.id} starting job ${job.jobId}`);
      
      await processorFunction(job);
      
      // Job completed successfully
      processor.status = 'idle';
      processor.currentJob = null;
      processor.startedAt = null;
      processor.completedJobs++;
      
      console.debug(`✅ Processor ${processor.id} completed job ${job.jobId} (total: ${processor.completedJobs})`);
      
    } catch (error) {
      // Job failed
      processor.status = 'error';
      processor.errorCount++;
      
      console.error(`❌ Processor ${processor.id} failed job ${job.jobId}:`, error);
      
      // Reset processor to idle after a brief delay
      setTimeout(() => {
        if (processor.status === 'error') {
          processor.status = 'idle';
          processor.currentJob = null;
          processor.startedAt = null;
          console.debug(`🔄 Processor ${processor.id} reset to idle after error`);
        }
      }, 5000); // 5 second cooldown after error
    }
  }

  /**
   * Get pool statistics for all phases
   */
  getPoolStats(): Record<JobPhase, { idle: number; busy: number; error: number; total: number }> {
    const stats = {} as Record<JobPhase, { idle: number; busy: number; error: number; total: number }>;
    
    for (const [phase, pool] of this.pools) {
      const idle = pool.filter(p => p.status === 'idle').length;
      const busy = pool.filter(p => p.status === 'busy').length;
      const error = pool.filter(p => p.status === 'error').length;
      
      stats[phase] = { idle, busy, error, total: pool.length };
    }
    
    return stats;
  }

  /**
   * Get detailed processor information
   */
  getProcessorDetails(phase?: JobPhase): Processor[] {
    if (phase) {
      return this.pools.get(phase)?.slice() || [];
    }
    
    // Return all processors
    const allProcessors: Processor[] = [];
    for (const pool of this.pools.values()) {
      allProcessors.push(...pool);
    }
    return allProcessors;
  }

  /**
   * Force reset stuck processors
   */
  resetStuckProcessors(maxProcessingTime: number = 300000): number { // 5 minutes default
    let resetCount = 0;
    const now = new Date();
    
    for (const pool of this.pools.values()) {
      for (const processor of pool) {
        if (processor.status === 'busy' && processor.startedAt) {
          const processingTime = now.getTime() - processor.startedAt.getTime();
          if (processingTime > maxProcessingTime) {
            console.warn(`⚠️ Resetting stuck processor ${processor.id} (processing for ${Math.round(processingTime/1000)}s)`);
            processor.status = 'idle';
            processor.currentJob = null;
            processor.startedAt = null;
            processor.errorCount++;
            resetCount++;
          }
        }
      }
    }
    
    return resetCount;
  }

  /**
   * Get current capacity for job assignment
   */
  getCapacity(): Record<JobPhase, number> {
    const capacity = {} as Record<JobPhase, number>;
    
    for (const [phase, pool] of this.pools) {
      capacity[phase] = pool.filter(p => p.status === 'idle').length;
    }
    
    return capacity;
  }

  /**
   * Health check for all processors
   */
  healthCheck(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];
    
    for (const [phase, pool] of this.pools) {
      const errorProcessors = pool.filter(p => p.status === 'error').length;
      const idleProcessors = pool.filter(p => p.status === 'idle').length;
      
      if (errorProcessors > pool.length * 0.3) { // More than 30% in error
        issues.push(`${phase}: ${errorProcessors}/${pool.length} processors in error state`);
      }
      
      if (idleProcessors === 0) { // No idle processors
        issues.push(`${phase}: No idle processors available`);
      }
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Restart all processors (for emergency reset)
   */
  restartAllProcessors(): void {
    console.warn('🔄 Restarting all processor pools...');
    
    for (const [phase, pool] of this.pools) {
      for (const processor of pool) {
        processor.status = 'idle';
        processor.currentJob = null;
        processor.startedAt = null;
        // Don't reset counters as they're useful for monitoring
      }
    }
    
    console.log('✅ All processor pools restarted');
  }
}
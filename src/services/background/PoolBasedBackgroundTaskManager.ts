/**
 * New pool-based background task manager that replaces the old single-threaded system
 * Uses JobScheduler, JobQueue, ProcessorPool, and JobCoordinator for robust job processing
 */

import { JobScheduler } from './JobScheduler';
import { JobQueue } from './JobQueue';
import { ProcessorPool } from './ProcessorPool';
import { JobCoordinator } from './JobCoordinator';

export class PoolBasedBackgroundTaskManager {
  private static instance: PoolBasedBackgroundTaskManager | null = null;
  private isRunning = false;
  private components = {
    scheduler: JobScheduler.getInstance(),
    queue: JobQueue.getInstance(),
    processorPool: ProcessorPool.getInstance(),
    coordinator: JobCoordinator.getInstance()
  };

  // Singleton pattern
  static getInstance(): PoolBasedBackgroundTaskManager {
    if (!PoolBasedBackgroundTaskManager.instance) {
      PoolBasedBackgroundTaskManager.instance = new PoolBasedBackgroundTaskManager();
    }
    return PoolBasedBackgroundTaskManager.instance;
  }

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Initialize and start the entire background processing system
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Pool-based background task manager is already running');
      return;
    }

    console.log('🚀 Starting pool-based background task manager...');
    this.isRunning = true;

    try {
      // Initialize coordinator with processor functions
      await this.components.coordinator.initialize();
      
      // Start all components in order
      this.components.scheduler.start();
      this.components.coordinator.start();
      
      console.log('✅ Pool-based background task manager started successfully');
      console.log('🎯 System components:');
      console.log('   - Job Scheduler: Discovering jobs every 1 minute');
      console.log('   - Job Queues: In-memory queues for each phase');
      console.log('   - Processor Pools: 10 processors per phase');
      console.log('   - Job Coordinator: Assigning jobs every 2 seconds');
      
    } catch (error) {
      console.error('❌ Failed to start pool-based background task manager:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the entire background processing system
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Pool-based background task manager is not running');
      return;
    }

    console.log('🛑 Stopping pool-based background task manager...');

    // Stop all components
    this.components.coordinator.stop();
    this.components.scheduler.stop();
    
    this.isRunning = false;
    console.log('✅ Pool-based background task manager stopped');
  }

  /**
   * Check if the system is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus(): {
    running: boolean;
    scheduler: { running: boolean; nextScan: Date | null; stats: { scanInterval: string; cleanupInterval: string; maxRetries: number } };
    coordinator: { running: boolean; systemHealth: { healthy: boolean; issues: string[] }; queueStats: Record<string, { queued: number; processing: number }>; poolStats: Record<string, { idle: number; busy: number; error: number; total: number }>; capacity: Record<string, number> };
    queues: Record<string, { queued: number; processing: number }>;
    processors: Record<string, { idle: number; busy: number; error: number; total: number }>;
    health: { healthy: boolean; issues: string[] };
  } {
    return {
      running: this.isRunning,
      scheduler: this.components.scheduler.getStatus(),
      coordinator: this.components.coordinator.getStatus(),
      queues: this.components.queue.getStats(),
      processors: this.components.processorPool.getPoolStats(),
      health: this.components.processorPool.healthCheck()
    };
  }

  /**
   * Force a manual scan for new jobs (useful for testing)
   */
  async forceScan(): Promise<void> {
    console.log('🔄 Force scanning for new jobs...');
    await this.components.scheduler.forceScan();
  }

  /**
   * Force cleanup of stuck jobs and processors
   */
  async forceCleanup(): Promise<void> {
    console.log('🧹 Force cleaning up stuck jobs and processors...');
    await this.components.scheduler.forceCleanup();
    
    // Also reset stuck processors
    const resetCount = this.components.processorPool.resetStuckProcessors();
    if (resetCount > 0) {
      console.log(`🔄 Reset ${resetCount} stuck processors`);
    }
  }

  /**
   * Emergency system reset
   */
  emergencyReset(): void {
    console.warn('🚨 Performing emergency system reset...');
    this.components.coordinator.emergencyReset();
    console.log('✅ Emergency reset completed');
  }

  /**
   * Get detailed performance metrics
   */
  getPerformanceMetrics(): {
    queueLengths: Record<string, { queued: number; processing: number }>;
    processorUtilization: Record<string, number>;
    systemCapacity: Record<string, number>;
    throughput: { jobsPerMinute: string; averageProcessingTime: string };
  } {
    const queueStats = this.components.queue.getStats();
    const poolStats = this.components.processorPool.getPoolStats();
    const capacity = this.components.processorPool.getCapacity();
    
    // Calculate utilization percentages
    const utilization: Record<string, number> = {};
    for (const [phase, stats] of Object.entries(poolStats)) {
      const phaseStats = stats as { idle: number; busy: number; error: number; total: number };
      utilization[phase] = phaseStats.total > 0 ? Math.round((phaseStats.busy / phaseStats.total) * 100) : 0;
    }

    return {
      queueLengths: queueStats,
      processorUtilization: utilization,
      systemCapacity: capacity,
      throughput: {
        // These would need to be tracked over time in a real implementation
        jobsPerMinute: 'Not implemented',
        averageProcessingTime: 'Not implemented'
      }
    };
  }

  /**
   * Run a single processing cycle (useful for testing)
   */
  async runOnce(): Promise<void> {
    console.log('🔄 Running single processing cycle...');
    
    // Force scan for new jobs
    await this.components.scheduler.forceScan();
    
    // Wait a moment for jobs to be queued
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // The coordinator will automatically assign jobs from the queues
    console.log('✅ Single processing cycle completed');
  }

  /**
   * Get system health report
   */
  getHealthReport(): {
    overall: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const health = this.components.processorPool.healthCheck();
    const queueStats = this.components.queue.getStats();
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check processor health
    if (!health.healthy) {
      issues.push(...health.issues);
    }
    
    // Check queue buildup
    for (const [phase, stats] of Object.entries(queueStats)) {
      const phaseStats = stats as { queued: number; processing: number };
      if (phaseStats.queued > 50) {
        issues.push(`${phase}: High queue buildup (${phaseStats.queued} jobs)`);
        recommendations.push(`Consider scaling up ${phase} processors`);
      }
    }
    
    // Determine overall health
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      overall = issues.some(issue => issue.includes('critical') || issue.includes('error')) ? 'critical' : 'warning';
    }
    
    return { overall, issues, recommendations };
  }

  /**
   * Enable or disable specific processing phases
   */
  setPhaseEnabled(phaseToControl: 'website-analysis' | 'prompt-forming' | 'model-analysis', enabled: boolean): void {
    // This would need to be implemented to pause/resume specific phases
    console.log(`📝 Phase control not yet implemented: ${phaseToControl} -> ${enabled ? 'enabled' : 'disabled'}`);
  }
}
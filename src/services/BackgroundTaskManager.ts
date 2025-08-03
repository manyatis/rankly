import { StagedAnalysisService } from './StagedAnalysisService';

export class BackgroundTaskManager {
  private static instance: BackgroundTaskManager | null = null;
  private intervals: NodeJS.Timeout[] = [];
  private isRunning = false;

  // Singleton pattern to ensure only one instance
  static getInstance(): BackgroundTaskManager {
    if (!BackgroundTaskManager.instance) {
      BackgroundTaskManager.instance = new BackgroundTaskManager();
    }
    return BackgroundTaskManager.instance;
  }

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Start all background tasks
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Background tasks are already running');
      return;
    }

    console.log('🚀 Starting background task manager...');
    this.isRunning = true;

    // Process not-started jobs every 10 seconds
    this.intervals.push(
      setInterval(async () => {
        try {
          await StagedAnalysisService.processNotStartedJobs();
        } catch (error) {
          console.error('❌ Error processing not-started jobs:', error);
        }
      }, 10000)
    );

    // Process prompt-forming jobs every 10 seconds (offset by 3 seconds)
    setTimeout(() => {
      this.intervals.push(
        setInterval(async () => {
          try {
            await StagedAnalysisService.processPromptFormingJobs();
          } catch (error) {
            console.error('❌ Error processing prompt-forming jobs:', error);
          }
        }, 10000)
      );
    }, 3000);

    // Process model-analysis jobs every 10 seconds (offset by 6 seconds)
    setTimeout(() => {
      this.intervals.push(
        setInterval(async () => {
          try {
            await StagedAnalysisService.processModelAnalysisJobs();
          } catch (error) {
            console.error('❌ Error processing model-analysis jobs:', error);
          }
        }, 10000)
      );
    }, 6000);

    console.log('✅ Background task manager started successfully');
    console.log('📊 Processing jobs every 10 seconds:');
    console.log('   - Not-started jobs: immediate');
    console.log('   - Prompt-forming jobs: +3s offset');
    console.log('   - Model-analysis jobs: +6s offset');
  }

  /**
   * Stop all background tasks
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Background tasks are not running');
      return;
    }

    console.log('🛑 Stopping background task manager...');
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.isRunning = false;
    
    console.log('✅ Background task manager stopped');
  }

  /**
   * Check if background tasks are running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Run a single cycle of all processors (useful for testing)
   */
  async runOnce(): Promise<void> {
    console.log('🔄 Running single cycle of all processors...');
    
    try {
      await StagedAnalysisService.processNotStartedJobs();
      await StagedAnalysisService.processPromptFormingJobs();
      await StagedAnalysisService.processModelAnalysisJobs();
      console.log('✅ Single cycle completed');
    } catch (error) {
      console.error('❌ Error during single cycle:', error);
      throw error;
    }
  }
}
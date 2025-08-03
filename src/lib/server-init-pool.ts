/**
 * Server initialization for the new pool-based background task system
 * This replaces the old single-threaded BackgroundTaskManager
 */

import { PoolBasedBackgroundTaskManager } from '../services/background/PoolBasedBackgroundTaskManager';

let isInitialized = false;

export async function initializeServer(): Promise<void> {
  if (isInitialized) {
    console.log('🔄 Server already initialized');
    return;
  }

  console.log('🚀 Initializing server with pool-based background processing...');

  try {
    // Check if background tasks should be enabled
    const enableBackgroundTasks = process.env.ENABLE_BACKGROUND_TASKS !== 'false';
    
    if (enableBackgroundTasks) {
      console.log('✅ Background tasks enabled, starting pool-based system...');
      
      const taskManager = PoolBasedBackgroundTaskManager.getInstance();
      await taskManager.start();
      
      console.log('✅ Pool-based background task system started successfully');
      
      // Log system status
      const status = taskManager.getSystemStatus();
      console.log('📊 System Status:', JSON.stringify({
        running: status.running,
        scheduler: status.scheduler.running,
        coordinator: status.coordinator.running,
        health: status.health.healthy
      }, null, 2));
      
    } else {
      console.log('⚠️ Background tasks disabled via ENABLE_BACKGROUND_TASKS=false');
    }

    // Set up graceful shutdown handlers
    setupGracefulShutdown();
    
    isInitialized = true;
    console.log('✅ Server initialization completed');

  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    throw error;
  }
}

/**
 * Set up graceful shutdown handlers for the background task system
 */
function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    console.log(`📡 Received ${signal}, starting graceful shutdown...`);
    
    try {
      const taskManager = PoolBasedBackgroundTaskManager.getInstance();
      if (taskManager.isActive()) {
        console.log('🛑 Stopping background task system...');
        taskManager.stop();
      }
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle different shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
}

/**
 * Get the current background task manager instance
 */
export function getBackgroundTaskManager(): PoolBasedBackgroundTaskManager {
  return PoolBasedBackgroundTaskManager.getInstance();
}

/**
 * Force initialization (useful for testing)
 */
export async function forceInitialize(): Promise<void> {
  isInitialized = false;
  await initializeServer();
}

/**
 * Check if server is initialized
 */
export function isServerInitialized(): boolean {
  return isInitialized;
}
import { BackgroundTaskManager } from '@/services/BackgroundTaskManager';

let initialized = false;

/**
 * Initialize server-side services
 * This function is called once when the server starts
 */
export function initializeServer() {
  if (initialized) {
    return;
  }

  console.log('🚀 Initializing server...');

  // Start background tasks by default, unless explicitly disabled
  const shouldRunBackgroundTasks = 
    process.env.ENABLE_BACKGROUND_TASKS !== 'false';

  if (shouldRunBackgroundTasks) {
    const taskManager = BackgroundTaskManager.getInstance();
    taskManager.start();
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📛 SIGTERM received, shutting down gracefully...');
      taskManager.stop();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('📛 SIGINT received, shutting down gracefully...');
      taskManager.stop();
      process.exit(0);
    });
  } else {
    console.log('⚠️ Background tasks disabled by ENABLE_BACKGROUND_TASKS=false');
    console.log('💡 To enable background tasks, remove ENABLE_BACKGROUND_TASKS or set it to true');
  }

  initialized = true;
  console.log('✅ Server initialization complete');
}

// Call initialization when this module is imported
initializeServer();
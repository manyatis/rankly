import { NextRequest, NextResponse } from 'next/server';
import { PoolBasedBackgroundTaskManager } from '@/services/background/PoolBasedBackgroundTaskManager';

export async function GET() {
  try {
    const taskManager = PoolBasedBackgroundTaskManager.getInstance();
    const systemStatus = taskManager.getSystemStatus();
    
    return NextResponse.json({
      ...systemStatus,
      message: taskManager.isActive() 
        ? 'Pool-based background tasks are running' 
        : 'Pool-based background tasks are stopped',
      performance: taskManager.getPerformanceMetrics(),
      healthReport: taskManager.getHealthReport()
    });
  } catch (error) {
    console.error('❌ Error checking background task status:', error);
    return NextResponse.json(
      { error: 'Failed to check background task status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    const taskManager = PoolBasedBackgroundTaskManager.getInstance();
    
    switch (action) {
      case 'start':
        await taskManager.start();
        return NextResponse.json({ 
          success: true, 
          message: 'Pool-based background tasks started',
          running: taskManager.isActive(),
          status: taskManager.getSystemStatus()
        });
        
      case 'stop':
        taskManager.stop();
        return NextResponse.json({ 
          success: true, 
          message: 'Pool-based background tasks stopped',
          running: taskManager.isActive(),
          status: taskManager.getSystemStatus()
        });
        
      case 'run-once':
        await taskManager.runOnce();
        return NextResponse.json({ 
          success: true, 
          message: 'Single processing cycle completed',
          running: taskManager.isActive(),
          status: taskManager.getSystemStatus()
        });

      case 'force-scan':
        await taskManager.forceScan();
        return NextResponse.json({ 
          success: true, 
          message: 'Force scan completed',
          running: taskManager.isActive(),
          status: taskManager.getSystemStatus()
        });

      case 'force-cleanup':
        await taskManager.forceCleanup();
        return NextResponse.json({ 
          success: true, 
          message: 'Force cleanup completed',
          running: taskManager.isActive(),
          status: taskManager.getSystemStatus()
        });

      case 'emergency-reset':
        taskManager.emergencyReset();
        return NextResponse.json({ 
          success: true, 
          message: 'Emergency reset completed',
          running: taskManager.isActive(),
          status: taskManager.getSystemStatus()
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, run-once, force-scan, force-cleanup, or emergency-reset' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Error managing background tasks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to manage background tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
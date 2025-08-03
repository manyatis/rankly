import { NextRequest, NextResponse } from 'next/server';
import { BackgroundTaskManager } from '@/services/BackgroundTaskManager';

export async function GET() {
  try {
    const taskManager = BackgroundTaskManager.getInstance();
    
    return NextResponse.json({
      running: taskManager.isActive(),
      message: taskManager.isActive() 
        ? 'Background tasks are running' 
        : 'Background tasks are stopped'
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
    const taskManager = BackgroundTaskManager.getInstance();
    
    switch (action) {
      case 'start':
        taskManager.start();
        return NextResponse.json({ 
          success: true, 
          message: 'Background tasks started',
          running: taskManager.isActive()
        });
        
      case 'stop':
        taskManager.stop();
        return NextResponse.json({ 
          success: true, 
          message: 'Background tasks stopped',
          running: taskManager.isActive()
        });
        
      case 'run-once':
        await taskManager.runOnce();
        return NextResponse.json({ 
          success: true, 
          message: 'Single cycle completed',
          running: taskManager.isActive()
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, or run-once' },
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
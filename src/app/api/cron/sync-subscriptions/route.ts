import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionSyncService } from '@/services/SubscriptionSyncService';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Daily subscription sync cron job started');

    // Use the service to sync all subscriptions
    const summary = await SubscriptionSyncService.syncAllSubscriptions();

    console.log('✅ Daily subscription sync cron job completed');

    return NextResponse.json({
      success: true,
      message: 'Subscription sync completed',
      summary
    });

  } catch (error) {
    console.error('❌ Subscription sync cron job failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Subscription sync failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
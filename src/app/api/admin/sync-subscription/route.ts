import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { SubscriptionSyncService } from '@/services/SubscriptionSyncService';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { userId } = await request.json();

    // If userId is provided, sync specific user, otherwise sync current user
    const targetUserId = userId || (await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    }))?.id;

    if (!targetUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`🔄 Manual subscription sync requested for user ID: ${targetUserId}`);

    // Sync the user's subscription
    const result = await SubscriptionSyncService.syncSingleUser(targetUserId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        update: result.update
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Manual subscription sync error:', error);
    
    return NextResponse.json(
      { 
        error: 'Subscription sync failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status and get users to downgrade
export async function GET(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    // Verify authentication  
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get users who need to be downgraded
    const usersToDowngrade = await SubscriptionSyncService.getUsersToDowngrade();

    // Get total subscription count
    const totalSubscriptions = await prisma.user.count({
      where: {
        subscriptionId: { not: null }
      }
    });

    return NextResponse.json({
      success: true,
      totalSubscriptions,
      usersToDowngrade: {
        count: usersToDowngrade.length,
        users: usersToDowngrade
      }
    });

  } catch (error) {
    console.error('❌ Subscription sync status error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get sync status', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
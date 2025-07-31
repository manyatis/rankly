import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { subscriptionsApi } from '@/lib/square';

export async function POST(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        subscriptionId: true, 
        subscriptionStatus: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    console.log(`🔄 Canceling subscription for ${user.email}: ${user.subscriptionId}`);

    // Cancel subscription with Square
    const cancelRequest = {
      subscriptionId: user.subscriptionId
    };

    const cancelResponse = await subscriptionsApi.cancel(cancelRequest);
    
    if (cancelResponse.errors && cancelResponse.errors.length > 0) {
      console.error('Square subscription cancellation errors:', cancelResponse.errors);
      throw new Error(`Subscription cancellation failed: ${JSON.stringify(cancelResponse.errors[0])}`);
    }

    const canceledSubscription = cancelResponse.subscription;
    console.log('✅ Subscription canceled in Square:', canceledSubscription?.id);

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionEndDate: new Date(),
        plan: 'free',
        subscriptionTier: 'free'
      }
    });

    console.log('✅ User downgraded to free tier in database');

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      status: 'canceled'
    });

  } catch (error) {
    console.error('❌ Subscription cancellation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
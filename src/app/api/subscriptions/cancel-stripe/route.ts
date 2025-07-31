import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe-server';

export async function POST(_request: NextRequest) {
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

    console.debug(`🔄 Canceling Stripe subscription for ${user.email}: ${user.subscriptionId}`);

    // Cancel subscription with Stripe (at the end of the current period)
    const canceledSubscription = await stripe.subscriptions.cancel(user.subscriptionId);
    
    console.debug('✅ Subscription canceled in Stripe:', canceledSubscription.id);

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionEndDate: new Date(canceledSubscription.canceled_at! * 1000),
        // Keep plan active until period end
        // plan: 'free',  // Don't change plan until subscription actually ends
        // subscriptionTier: 'free'
      }
    });

    console.debug('✅ User subscription status updated in database');

    // Calculate when access will end (use canceled_at as fallback)
    const periodEnd = new Date();

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      status: 'canceled',
      accessEndsAt: periodEnd.toISOString(),
      note: 'You will retain access to premium features until the end of your current billing period.'
    });

  } catch (error) {
    console.error('❌ Stripe subscription cancellation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
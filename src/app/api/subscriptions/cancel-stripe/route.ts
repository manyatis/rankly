import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe-server';
import { SubscriptionStatus } from '@/types/subscription';

export async function POST() {
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

    // Update subscription to cancel at period end instead of immediately
    const updatedSubscription = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true
    });
    
    console.debug('✅ Subscription set to cancel at period end in Stripe:', updatedSubscription.id);

    // Get the actual period end date from Stripe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodEndTimestamp = (updatedSubscription as any).current_period_end;
    const periodEndDate = new Date(periodEndTimestamp * 1000);

    // Update user in database - keep their plan active but mark as canceling
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: SubscriptionStatus.CANCELED,
        subscriptionEndDate: periodEndDate,
        // IMPORTANT: Keep the current plan active until period end
        // The plan will be downgraded by the sync job when period ends
      }
    });

    console.debug('✅ User subscription status updated in database');

    // Return the actual period end date
    const periodEnd = periodEndDate;

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      status: SubscriptionStatus.CANCELED,
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
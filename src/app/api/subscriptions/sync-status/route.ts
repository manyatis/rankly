import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe-server';
import { SubscriptionStatus } from '@/types/subscription';

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
        subscriptionStatus: true,
        plan: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.subscriptionId) {
      return NextResponse.json({ 
        success: true, 
        message: 'No subscription to sync',
        status: SubscriptionStatus.FREE,
        plan: 'free'
      });
    }

    console.debug('🔄 Syncing subscription status for user:', user.email);

    // Get latest subscription status from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
    
    console.debug('📋 Stripe subscription status:', subscription.status);
    console.debug('📋 Current DB status:', user.subscriptionStatus);

    // Determine plan from subscription
    let planId = 'free';
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      const plan = await prisma.subscriptionPlan.findFirst({
        where: { stripePriceId: priceId }
      });
      if (plan) {
        planId = plan.planId;
      }
    }

    // Update user in database
    const updateData: {
      subscriptionStatus: string;
      stripePriceId: string | null;
      plan?: string;
      subscriptionTier?: string;
      subscriptionStartDate?: Date;
      subscriptionEndDate?: Date;
    } = {
      subscriptionStatus: subscription.status,
      stripePriceId: subscription.items.data[0]?.price.id || null,
    };

    // Handle different subscription statuses
    if (subscription.status === SubscriptionStatus.ACTIVE) {
      updateData.plan = planId;
      updateData.subscriptionTier = planId;
      if (!user.plan || user.plan === 'free') {
        updateData.subscriptionStartDate = new Date();
      }
    } else if ([SubscriptionStatus.CANCELED, SubscriptionStatus.UNPAID, SubscriptionStatus.PAST_DUE, SubscriptionStatus.INCOMPLETE_EXPIRED].includes(subscription.status as SubscriptionStatus)) {
      // Downgrade to free if subscription is no longer active
      updateData.plan = 'free';
      updateData.subscriptionTier = 'free';
      updateData.subscriptionEndDate = new Date();
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    console.debug('✅ Subscription synced:', subscription.status, 'Plan:', updateData.plan);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      oldStatus: user.subscriptionStatus,
      newStatus: subscription.status,
      oldPlan: user.plan,
      newPlan: updateData.plan,
      message: 'Subscription status synced successfully'
    });

  } catch (error) {
    console.error('❌ Error syncing subscription:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  console.log('🔔 Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      
      // Note: invoice events will be handled in a future update
      
      default:
        console.log(`🔔 Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('🔄 Processing subscription change:', subscription.id, 'Status:', subscription.status);

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: subscription.customer as string }
  });

  if (!user) {
    console.error('❌ User not found for customer:', subscription.customer);
    return;
  }

  // Determine plan from subscription items
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

  // Update user subscription info
  const updateData: {
    subscriptionId: string;
    subscriptionStatus: string;
    stripePriceId?: string | null;
    plan?: string;
    subscriptionTier?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
  } = {
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    stripePriceId: subscription.items.data[0]?.price.id || null,
  };

  // Handle different subscription statuses
  if (subscription.status === 'active') {
    updateData.plan = planId;
    updateData.subscriptionTier = planId;
    // Set subscription start date
    updateData.subscriptionStartDate = new Date();
  } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
    // Downgrade to free if subscription is no longer active
    updateData.plan = 'free';
    updateData.subscriptionTier = 'free';
    updateData.subscriptionEndDate = new Date();
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData
  });

  console.log('✅ Updated user subscription:', user.email, 'Status:', subscription.status, 'Plan:', updateData.plan);
}


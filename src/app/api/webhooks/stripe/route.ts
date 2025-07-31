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
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_action_required':
        console.log('⚠️ Payment requires additional action for invoice:', (event.data.object as Stripe.Invoice).id);
        break;
      
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
  let planName = 'Free';
  if (subscription.items.data.length > 0) {
    const priceId = subscription.items.data[0].price.id;
    console.log('🔍 Looking up plan for price ID:', priceId);
    
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { stripePriceId: priceId }
    });
    
    if (plan) {
      planId = plan.planId;
      planName = plan.name;
      console.log('✅ Found plan:', planName, '(' + planId + ')');
    } else {
      console.error('❌ No plan found for price ID:', priceId);
      console.log('💡 Available plans in database:');
      const allPlans = await prisma.subscriptionPlan.findMany({
        select: { planId: true, name: true, stripePriceId: true }
      });
      allPlans.forEach(p => {
        console.log(`  - ${p.name} (${p.planId}): ${p.stripePriceId || 'NO_PRICE_ID'}`);
      });
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
    console.log('✅ Setting user to active plan:', planName);
  } else if (subscription.status === 'incomplete') {
    // Keep subscription info but don't activate the plan yet
    // User will get upgraded when payment is completed and status becomes 'active'
    console.log('⏳ Subscription incomplete - waiting for payment confirmation');
    // Don't change the plan yet, keep existing plan
    // Just update the subscription tracking info
  } else if (['canceled', 'unpaid', 'past_due', 'incomplete_expired'].includes(subscription.status)) {
    // Downgrade to free if subscription is no longer active
    updateData.plan = 'free';
    updateData.subscriptionTier = 'free';
    updateData.subscriptionEndDate = new Date();
    console.log('⬇️ Downgrading user to free plan due to status:', subscription.status);
  } else {
    console.log('❓ Unhandled subscription status:', subscription.status);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData
  });

  console.log('✅ Updated user subscription:', user.email, 'Status:', subscription.status, 'Plan:', updateData.plan || 'unchanged');
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💳 Invoice payment succeeded:', invoice.id);
  
  // Only process subscription invoices
  const invoiceAny = invoice as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const subscriptionId = typeof invoiceAny.subscription === 'string' 
    ? invoiceAny.subscription 
    : invoiceAny.subscription?.id;
    
  if (!subscriptionId) {
    console.log('ℹ️ Invoice not related to a subscription, skipping');
    return;
  }

  // Find user by customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer as string }
  });

  if (!user) {
    console.error('❌ User not found for customer:', invoice.customer);
    return;
  }

  // Fetch the latest subscription status from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  console.log('🔄 Subscription status after payment:', subscription.status);
  
  // If subscription is now active, update the user
  if (subscription.status === 'active') {
    // Get the plan details
    const priceId = subscription.items.data[0]?.price.id;
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { stripePriceId: priceId }
    });
    
    if (plan) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'active',
          plan: plan.planId,
          subscriptionTier: plan.planId,
          subscriptionStartDate: new Date()
        }
      });
      
      console.log('✅ User upgraded to', plan.name, 'plan after successful payment');
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Invoice payment failed:', invoice.id);
  
  // Only process subscription invoices
  const invoiceAny = invoice as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const subscriptionId = typeof invoiceAny.subscription === 'string' 
    ? invoiceAny.subscription 
    : invoiceAny.subscription?.id;
    
  if (!subscriptionId) {
    return;
  }

  // Find user by customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer as string }
  });

  if (!user) {
    console.error('❌ User not found for customer:', invoice.customer);
    return;
  }

  // Log the failure but don't immediately downgrade
  // Stripe will retry the payment according to your retry settings
  console.log('⚠️ Payment failed for user:', user.email);
  console.log('ℹ️ Stripe will retry according to retry rules');
  
  // You might want to send an email to the user here
  // or update a payment_failed flag in the database
}


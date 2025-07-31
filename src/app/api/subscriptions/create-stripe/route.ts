import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe-server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { planId } = await request.json();

    // Validate required fields
    if (!planId) {
      return NextResponse.json(
        { error: 'Missing required field: planId' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        stripeCustomerId: true, 
        subscriptionId: true,
        subscriptionStatus: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    if (user.subscriptionId && user.subscriptionStatus === 'active') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    // Get subscription plan details
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { planId }
    });

    if (!subscriptionPlan || !subscriptionPlan.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive subscription plan' }, { status: 400 });
    }

    console.log(`🔄 Creating Stripe subscription for ${user.email}: ${subscriptionPlan.name} plan`);

    // Create or get existing Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      console.log('👤 Creating Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id.toString(),
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId }
      });
      
      console.log('✅ Stripe customer created:', stripeCustomerId);
    }

    // For now, we'll use a test price ID. In production, you would create prices in Stripe dashboard
    // and store them in the subscriptionPlan.stripePriceId field
    let stripePriceId = subscriptionPlan.stripePriceId;
    
    if (!stripePriceId) {
      // Create a price on the fly for testing (you'd normally do this once in Stripe dashboard)
      console.log('💰 Creating Stripe price...');
      
      // First, create or get the product
      const product = await stripe.products.create({
        name: `Rankly ${subscriptionPlan.name} Plan`,
        description: subscriptionPlan.description || undefined,
        metadata: {
          planId: subscriptionPlan.planId,
        }
      });

      const price = await stripe.prices.create({
        unit_amount: subscriptionPlan.priceCents,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        product: product.id,
        metadata: {
          planId: subscriptionPlan.planId,
        }
      });
      
      stripePriceId = price.id;
      
      // Update subscription plan with Stripe IDs
      await prisma.subscriptionPlan.update({
        where: { id: subscriptionPlan.id },
        data: { 
          stripePriceId,
          stripeProductId: product.id
        }
      });
      
      console.log('✅ Stripe price created:', stripePriceId);
    }

    // Create Stripe subscription
    console.log('📋 Creating Stripe subscription...');
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: stripePriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent', 'latest_invoice'],
      metadata: {
        userId: user.id.toString(),
        planId: subscriptionPlan.planId,
      }
    });

    // Update user in database with subscription info
    const now = new Date();
    console.log('📋 Stripe subscription status:', subscription.status);
    console.log('📋 Latest invoice type:', typeof subscription.latest_invoice);
    console.log('📋 Latest invoice id:', typeof subscription.latest_invoice === 'string' ? subscription.latest_invoice : subscription.latest_invoice?.id);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionStartDate: now,
        stripePriceId,
        plan: planId,
        subscriptionTier: planId,
        dailyUsageCount: 0 // Reset usage count
      }
    });

    console.log('✅ User subscription updated in database with status:', subscription.status);

    // Get the payment intent from the subscription
    // The latest_invoice might be a string ID or an expanded object
    let clientSecret: string | undefined;
    let invoiceStatus: string | undefined;
    
    if (typeof subscription.latest_invoice === 'string') {
      // Invoice is not expanded, we need to retrieve it
      console.log('📋 Invoice not expanded, retrieving invoice:', subscription.latest_invoice);
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice, {
        expand: ['payment_intent']
      });
      
      invoiceStatus = invoice.status || undefined;
      const expandedInvoice = invoice as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (expandedInvoice.payment_intent) {
        const paymentIntent = expandedInvoice.payment_intent as Stripe.PaymentIntent;
        clientSecret = paymentIntent?.client_secret || undefined;
        console.log('💳 Payment intent:', paymentIntent?.id);
      }
      
      console.log('💳 Retrieved invoice status:', invoiceStatus);
      console.log('💳 Client secret:', clientSecret ? 'Present' : 'Missing');
    } else if (subscription.latest_invoice) {
      // Invoice is expanded
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      invoiceStatus = invoice.status || undefined;
      
      // payment_intent might be a string or expanded object
      const expandedInvoice = invoice as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (typeof expandedInvoice.payment_intent === 'string') {
        console.log('📋 Payment intent not expanded, retrieving:', expandedInvoice.payment_intent);
        const paymentIntent = await stripe.paymentIntents.retrieve(expandedInvoice.payment_intent);
        clientSecret = paymentIntent.client_secret || undefined;
      } else if (expandedInvoice.payment_intent) {
        const paymentIntent = expandedInvoice.payment_intent as Stripe.PaymentIntent;
        clientSecret = paymentIntent?.client_secret || undefined;
      }
      
      console.log('💳 Expanded invoice status:', invoiceStatus);
      console.log('💳 Client secret:', clientSecret ? 'Present' : 'Missing');
    }

    // If there's no client secret, the subscription might be immediately active (e.g., trial period)
    if (!clientSecret && subscription.status === 'active') {
      console.log('✅ Subscription is already active without payment');
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      planId: planId,
      planName: subscriptionPlan.name,
      clientSecret: clientSecret,
      invoiceStatus: invoiceStatus,
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('❌ Stripe subscription creation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe-server';

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

    // Create Stripe Checkout Session for subscription
    console.log('📋 Creating Stripe Checkout Session...');
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{
        price: stripePriceId,
        quantity: 1,
      }],
      success_url: `${process.env.NEXTAUTH_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscribe/cancel`,
      metadata: {
        userId: user.id.toString(),
        planId: subscriptionPlan.planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id.toString(),
          planId: subscriptionPlan.planId,
        }
      }
    });

    console.log('✅ Checkout Session created:', checkoutSession.id);

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
      planId: planId,
      planName: subscriptionPlan.name,
      message: 'Checkout session created successfully'
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
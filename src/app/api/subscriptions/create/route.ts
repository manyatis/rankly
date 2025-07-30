import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { subscriptionsApi, customersApi, cardsApi } from '@/lib/square';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { cardToken, planId } = await request.json();

    // Validate required fields
    if (!cardToken || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields: cardToken and planId' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, customerId: true, subscriptionId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    if (user.subscriptionId) {
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

    console.log(`🔄 Creating subscription for ${user.email}: ${subscriptionPlan.name} plan`);

    let customerId = user.customerId;

    // Create Square customer if doesn't exist
    if (!customerId) {
      const customerRequest = {
        givenName: user.name?.split(' ')[0] || 'Customer',
        familyName: user.name?.split(' ').slice(1).join(' ') || '',
        emailAddress: user.email
      };

      console.log('👤 Creating Square customer...');
      const customerResponse = await customersApi.createCustomer(customerRequest);
      
      if (customerResponse.result.errors) {
        console.error('Square customer creation errors:', customerResponse.result.errors);
        throw new Error(`Customer creation failed: ${JSON.stringify(customerResponse.result.errors[0])}`);
      }

      customerId = customerResponse.result.customer?.id || null;
      
      if (!customerId) {
        throw new Error('Failed to create Square customer');
      }

      // Update user with Square customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { customerId }
      });

      console.log('✅ Square customer created:', customerId);
    }

    // Create card on file
    console.log('💳 Creating card on file...');
    const cardRequest = {
      idempotencyKey: randomUUID(),
      sourceId: cardToken,
      card: {
        customerId: customerId
      }
    };

    const cardResponse = await cardsApi.createCard(cardRequest);
    
    if (cardResponse.result.errors) {
      console.error('Square card creation errors:', cardResponse.result.errors);
      throw new Error(`Card creation failed: ${JSON.stringify(cardResponse.result.errors[0])}`);
    }

    const cardId = cardResponse.result.card?.id;
    if (!cardId) {
      throw new Error('Failed to create card on file');
    }

    console.log('✅ Card on file created:', cardId);

    // Create subscription
    console.log('📋 Creating subscription...');
    const subscriptionRequest = {
      idempotencyKey: randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID!,
      planVariationId: subscriptionPlan.squarePlanId!, // This should be the Square catalog plan variation ID
      customerId: customerId,
      cardId: cardId,
      timezone: 'America/New_York', // You might want to make this configurable
      source: {
        name: 'Rankly Subscription'
      }
    };

    const subscriptionResponse = await subscriptionsApi.createSubscription(subscriptionRequest);
    
    if (subscriptionResponse.result.errors) {
      console.error('Square subscription creation errors:', subscriptionResponse.result.errors);
      throw new Error(`Subscription creation failed: ${JSON.stringify(subscriptionResponse.result.errors[0])}`);
    }

    const subscription = subscriptionResponse.result.subscription;
    if (!subscription?.id) {
      throw new Error('Failed to create subscription');
    }

    console.log('✅ Subscription created:', subscription.id);

    // Update user in database with subscription info
    const now = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status || 'ACTIVE',
        subscriptionStartDate: now,
        cardOnFileId: cardId,
        plan: planId,
        subscriptionTier: planId,
        dailyUsageCount: 0 // Reset usage count
      }
    });

    console.log('✅ User subscription updated in database');

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      planId: planId,
      planName: subscriptionPlan.name,
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('❌ Subscription creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create subscription', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
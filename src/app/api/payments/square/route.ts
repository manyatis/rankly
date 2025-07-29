import { NextRequest, NextResponse } from 'next/server';
import { SquareClient } from 'square';
import { randomUUID } from 'crypto';
import { getUser } from '../../../../lib/auth';
import { prisma } from '@/lib/prisma';

// Initialize Square client
const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
});

const { payments } = client;

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getUser();
    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { sourceId, amount, planId, planName, userEmail } = await request.json();

    // Validate required fields
    if (!sourceId || !amount || !planId || !planName) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Verify user email matches authenticated user
    if (userEmail !== user.email) {
      return NextResponse.json(
        { error: 'User verification failed' },
        { status: 403 }
      );
    }

    console.debug(`🔄 Processing payment for ${user.email}: ${planName} plan ($${amount / 100})`);

    // Create payment request
    const paymentRequest = {
      idempotencyKey: randomUUID(),
      sourceId,
      amountMoney: {
        amount: amount,
        currency: 'USD' as const,
      },
      note: `Rankly ${planName} Plan - ${user.email}`,
      buyerEmailAddress: user.email,
    };

    console.debug('💳 Sending payment request to Square...');
    
    // Process payment with Square
    const response = await payments.create(paymentRequest);

    console.debug('✅ Payment processed successfully:', response.payment?.id);

    // Update user's subscription status in database
    if (response.payment?.status === 'COMPLETED') {
      console.debug('💾 Updating user subscription in database...');
      
      await prisma.user.update({
        where: { email: user.email },
        data: {
          plan: planId,
          subscriptionTier: planId,
          dailyUsageCount: 0, // Reset usage count on plan upgrade
          updatedAt: new Date()
        }
      });
      
      console.debug('✅ User subscription updated successfully');
    }

    return NextResponse.json({
      success: true,
      paymentId: response.payment?.id,
      status: response.payment?.status,
      planId,
      planName,
      amount: amount / 100,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('❌ Square payment error:', error);
    
    // Handle Square API errors
    if (error && typeof error === 'object' && 'errors' in error) {
      const squareError = error as { errors?: Array<{ detail?: string }> };
      const errorMessage = squareError.errors?.[0]?.detail || 'Payment processing failed';
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Payment processing failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
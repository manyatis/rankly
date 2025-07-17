import { NextRequest, NextResponse } from 'next/server';
// import { SquareClient } from 'square';
import { randomUUID } from 'crypto';
import { getUser } from '../../../../lib/auth';

// // Handle BigInt serialization for Square API responses
// BigInt.prototype.toJSON = function () {
//   return this.toString();
// };

// // Initialize Square client
// const client = new SquareClient({
//   token: process.env.SQUARE_ACCESS_TOKEN!,
//   environment: process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
// });

// const { payments } = client;

export async function POST(request: NextRequest) {
  // try {
  //   // Verify authentication
  //   const user = await getUser();
  //   if (!user?.email) {
  //     return NextResponse.json(
  //       { error: 'Authentication required' },
  //       { status: 401 }
  //     );
  //   }

  //   const { sourceId, amount, planId, planName, userEmail } = await request.json();

  //   // Validate required fields
  //   if (!sourceId || !amount || !planId || !planName) {
  //     return NextResponse.json(
  //       { error: 'Missing required payment information' },
  //       { status: 400 }
  //     );
  //   }

  //   // Validate amount is positive
  //   if (amount <= 0) {
  //     return NextResponse.json(
  //       { error: 'Invalid payment amount' },
  //       { status: 400 }
  //     );
  //   }

  //   // Verify user email matches authenticated user
  //   if (userEmail !== user.email) {
  //     return NextResponse.json(
  //       { error: 'User verification failed' },
  //       { status: 403 }
  //     );
  //   }

  //   console.log(`🔄 Processing payment for ${user.email}: ${planName} plan ($${amount / 100})`);

  //   // Create payment request
  //   const paymentRequest = {
  //     idempotencyKey: randomUUID(),
  //     sourceId,
  //     amountMoney: {
  //       amount: amount,
  //       currency: 'USD',
  //     },
  //     note: `SearchDogAI ${planName} Plan - ${user.email}`,
  //     buyerEmailAddress: user.email,
  //   };

  //   console.log('💳 Sending payment request to Square...');
    
  //   // Process payment with Square
  //   // const { result } = await payments.complete(paymentRequest);

  //   console.log('✅ Payment processed successfully:', result.payment?.id);

  //   // TODO: Update user's subscription status in database
  //   // This would typically involve:
  //   // 1. Updating user's plan in your database
  //   // 2. Setting subscription start/end dates
  //   // 3. Updating usage limits
  //   // 4. Sending confirmation email

  //   return NextResponse.json({
  //     success: true,
  //     paymentId: result.payment?.id,
  //     status: result.payment?.status,
  //     planId,
  //     planName,
  //     amount: amount / 100,
  //     message: 'Payment processed successfully'
  //   });

  // } catch (error) {
  //   console.error('❌ Square payment error:', error);
    
  //   // Handle Square API errors
  //   if (error && typeof error === 'object' && 'errors' in error) {
  //     const squareError = error as any;
  //     const errorMessage = squareError.errors?.[0]?.detail || 'Payment processing failed';
      
  //     return NextResponse.json(
  //       { error: errorMessage },
  //       { status: 400 }
  //     );
  //   }

  //   // Handle other errors
  //   return NextResponse.json(
  //     { error: 'Payment processing failed. Please try again.' },
  //     { status: 500 }
  //   );
  // }
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
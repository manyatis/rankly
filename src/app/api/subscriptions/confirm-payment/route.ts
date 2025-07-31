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

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID required' }, { status: 400 });
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

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    // If user has a subscription, update its status
    if (user.subscriptionId) {
      // First, get the subscription with expanded invoice
      const subscription = await stripe.subscriptions.retrieve(user.subscriptionId, {
        expand: ['latest_invoice']
      });
      
      console.log('🔄 Updating subscription status after payment confirmation');
      console.log('📋 Current subscription status:', subscription.status);
      
      // If subscription is still incomplete, we might need to pay the invoice
      if (subscription.status === 'incomplete') {
        const latestInvoice = (subscription as Stripe.Response<Stripe.Subscription> & {
          latest_invoice?: Stripe.Invoice;
        }).latest_invoice;
        console.log('📋 Latest invoice status:', latestInvoice?.status);
        console.log('📋 Latest invoice ID:', latestInvoice?.id);
        
        // If the invoice is open, we need to pay it
        if (latestInvoice && latestInvoice.status === 'open') {
          console.log('💳 Attempting to pay open invoice:', latestInvoice.id);
          try {
            const paidInvoice = await stripe.invoices.pay(latestInvoice.id);
            console.log('✅ Invoice paid successfully:', paidInvoice.status);
          } catch (invoiceError) {
            console.error('❌ Error paying invoice:', invoiceError);
            // The invoice might already be paid or payment might have failed
          }
        }
        
        // Retrieve subscription again to get updated status
        const updatedSubscription = await stripe.subscriptions.retrieve(user.subscriptionId);
        console.log('📋 Updated subscription status:', updatedSubscription.status);
        
        // Update user in database with latest subscription status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: updatedSubscription.status,
          }
        });

        return NextResponse.json({
          success: true,
          subscriptionId: updatedSubscription.id,
          status: updatedSubscription.status,
          message: 'Payment confirmed and subscription updated'
        });
      }

      // Update user in database with latest subscription status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: subscription.status,
        }
      });

      console.log('✅ Subscription status updated:', subscription.status);

      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status,
        message: 'Payment confirmed and subscription updated'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed'
    });

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    return NextResponse.json(
      {
        error: 'Failed to confirm payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
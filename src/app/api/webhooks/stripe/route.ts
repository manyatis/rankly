import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is working' });
}

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook POST received');
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    console.log('Body length:', body.length);
    console.log('Has signature:', !!signature);
    
    // For now, just return success to test the endpoint
    return NextResponse.json({ 
      received: true, 
      message: 'Webhook endpoint is working',
      hasSignature: !!signature,
      bodyLength: body.length
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
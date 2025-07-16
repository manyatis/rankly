import { NextRequest, NextResponse } from 'next/server';
import { checkUsageLimit } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const email = authorization?.replace('Bearer ', '');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 401 });
    }

    const usageInfo = await checkUsageLimit(email);
    return NextResponse.json(usageInfo);
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
  }
}
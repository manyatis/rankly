import { NextRequest, NextResponse } from 'next/server';
import { checkUsageLimit, getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Use session-based authentication instead of Bearer token
    const user = await getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const usageInfo = await checkUsageLimit(user.email);
    return NextResponse.json(usageInfo);
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
  }
}
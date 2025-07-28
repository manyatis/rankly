import { NextRequest, NextResponse } from 'next/server';
import { getUser, checkRateLimit } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') as 'analyzeWebsite' | 'generatePrompts';
    
    if (!action || (action !== 'analyzeWebsite' && action !== 'generatePrompts')) {
      return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }

    const rateLimitStatus = await checkRateLimit(user.email, action);
    
    return NextResponse.json({
      canUse: rateLimitStatus.canUse,
      remainingUses: rateLimitStatus.remainingUses,
      waitMinutes: rateLimitStatus.waitMinutes,
      resetTime: rateLimitStatus.resetTime
    });
  } catch (error) {
    console.error('Rate limit check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
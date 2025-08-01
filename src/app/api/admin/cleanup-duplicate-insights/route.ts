import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { AIInsightsService } from '@/services/AIInsightsService';

/**
 * POST /api/admin/cleanup-duplicate-insights
 * Remove duplicate AI insights for a specific business
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { businessId } = await request.json();
    
    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    // Remove duplicates for this business
    await AIInsightsService.removeDuplicateInsights(businessId, parseInt(user.id!));

    return NextResponse.json({ 
      success: true, 
      message: 'Duplicate insights cleaned up successfully' 
    });

  } catch (error) {
    console.error('❌ Cleanup duplicate insights error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup duplicate insights' },
      { status: 500 }
    );
  }
}
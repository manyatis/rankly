import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { AIInsightsService } from '@/services/AIInsightsService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { insightId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { insightId } = params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['new', 'in_progress', 'completed', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get user ID from session
    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const updatedInsight = await AIInsightsService.updateInsightStatus(
      insightId,
      status,
      userId
    );

    return NextResponse.json({ insight: updatedInsight });

  } catch (error) {
    console.error('Error updating AI insight status:', error);
    return NextResponse.json(
      { error: 'Failed to update insight status' },
      { status: 500 }
    );
  }
}
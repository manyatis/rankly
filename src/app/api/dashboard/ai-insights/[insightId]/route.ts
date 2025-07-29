import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';


export async function PATCH(
  request: NextRequest,
  { params }: { params: { insightId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { insightId } = params;
    const { status } = await request.json();

    if (!['new', 'in_progress', 'completed', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: {
          include: {
            businesses: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the insight and verify access
    const insight = await prisma.aiInsight.findUnique({
      where: { id: insightId },
      include: {
        business: true
      }
    });

    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    // Verify the insight belongs to a business in user's organization
    const userBusinessIds = user.organization?.businesses.map(b => b.id) || [];
    if (!userBusinessIds.includes(insight.businessId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the insight status
    const updatedInsight = await prisma.aiInsight.update({
      where: { id: insightId },
      data: { status }
    });

    return NextResponse.json({ insight: updatedInsight });

  } catch (error) {
    console.error('Error updating AI insight:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
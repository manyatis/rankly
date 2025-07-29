import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
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

    // Verify business belongs to user's organization
    const business = user.organization?.businesses.find(b => b.id === parseInt(businessId));
    if (!business) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 });
    }

    // Get AI insights for this business
    const insights = await prisma.aiInsight.findMany({
      where: {
        businessId: parseInt(businessId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ insights });

  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
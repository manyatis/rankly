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
    const businessIdParam = searchParams.get('businessId');
    const daysParam = searchParams.get('days') || '30';
    
    if (!businessIdParam) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const businessId = parseInt(businessIdParam);
    const days = parseInt(daysParam);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has access to this business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { organization: true }
    });

    if (!business || business.organization.id !== user.organizationId) {
      return NextResponse.json({ error: 'Access denied to business' }, { status: 403 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch ranking history for the business
    const rankings = await prisma.rankingHistory.findMany({
      where: {
        businessId: businessId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        createdAt: true,
        openaiRank: true,
        claudeRank: true,
        perplexityRank: true,
        averageRank: true,
        websiteScore: true,
        hasWebsiteAnalysis: true
      }
    });

    return NextResponse.json({ rankings });

  } catch (error) {
    console.error('Error fetching ranking history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
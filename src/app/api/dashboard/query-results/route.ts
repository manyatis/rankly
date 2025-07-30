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
      include: { 
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!business || !business.organizations.some(org => org.organization.id === user.organizationId)) {
      return NextResponse.json({ error: 'Access denied to business' }, { status: 403 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch query results for the business
    const queryResults = await prisma.queryResult.findMany({
      where: {
        businessId: businessId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        query: true,
        aiProvider: true,
        response: true,
        mentioned: true,
        rankPosition: true,
        relevanceScore: true,
        wordCount: true,
        businessDensity: true,
        createdAt: true,
        runUuid: true
      }
    });

    // Group by runUuid to organize by analysis runs
    const groupedResults = queryResults.reduce((acc, result) => {
      const runId = result.runUuid || 'unknown';
      if (!acc[runId]) {
        acc[runId] = [];
      }
      acc[runId].push(result);
      return acc;
    }, {} as Record<string, typeof queryResults>);

    return NextResponse.json({ 
      queryResults,
      groupedResults,
      totalQueries: queryResults.length,
      mentionedQueries: queryResults.filter(q => q.mentioned).length,
      averagePosition: queryResults
        .filter(q => q.mentioned && q.rankPosition)
        .reduce((sum, q, _, arr) => sum + (q.rankPosition! / arr.length), 0) || null
    });

  } catch (error) {
    console.error('Error fetching query results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
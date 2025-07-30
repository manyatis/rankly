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

    // Get the business to verify access
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organizations: {
          where: {
            organizationId: user.organizationId!
          }
        }
      }
    });

    if (!business || business.organizations.length === 0) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get competitors for this business
    const competitors = await prisma.competitor.findMany({
      where: {
        businessId: businessId
      },
      include: {
        competitor: true
      }
    });

    // Get ranking history for all competitors
    const competitorIds = competitors.map(c => c.competitorId);
    const competitorRankings = await prisma.rankingHistory.findMany({
      where: {
        businessId: {
          in: competitorIds
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        business: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get main business rankings for comparison
    const mainBusinessRankings = await prisma.rankingHistory.findMany({
      where: {
        businessId: businessId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        business: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Combine and format the data
    const allRankings = [...mainBusinessRankings, ...competitorRankings].map(ranking => ({
      id: ranking.id,
      businessId: ranking.businessId,
      businessName: ranking.business.websiteName,
      isMainBusiness: ranking.businessId === businessId,
      createdAt: ranking.createdAt.toISOString(),
      openaiRank: ranking.openaiRank,
      claudeRank: ranking.claudeRank,
      perplexityRank: ranking.perplexityRank,
      averageRank: ranking.averageRank,
      websiteScore: ranking.websiteScore,
      hasWebsiteAnalysis: ranking.hasWebsiteAnalysis
    }));

    // Get competitor metadata with latest rankings (top 8 only)
    const competitorMetadata = await Promise.all(
      competitors.slice(0, 8).map(async c => {
        // Get the latest ranking for this competitor
        const latestRanking = await prisma.rankingHistory.findFirst({
          where: {
            businessId: c.competitorId
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            openaiRank: true,
            claudeRank: true,
            perplexityRank: true,
            averageRank: true,
            createdAt: true
          }
        });

        return {
          id: c.competitorId,
          name: c.competitor.websiteName,
          website: c.competitor.websiteUrl,
          confidence: c.confidence,
          identifiedBy: c.identifiedBy,
          createdAt: c.createdAt.toISOString(),
          latestRanking: latestRanking ? {
            openaiRank: latestRanking.openaiRank,
            claudeRank: latestRanking.claudeRank,
            perplexityRank: latestRanking.perplexityRank,
            averageRank: latestRanking.averageRank,
            lastUpdated: latestRanking.createdAt.toISOString()
          } : null
        };
      })
    );

    // Get main business latest ranking for comparison
    const mainBusinessLatestRanking = await prisma.rankingHistory.findFirst({
      where: {
        businessId: businessId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        business: true
      }
    });

    const mainBusinessInfo = mainBusinessLatestRanking ? {
      id: mainBusinessLatestRanking.businessId,
      name: mainBusinessLatestRanking.business.websiteName,
      website: mainBusinessLatestRanking.business.websiteUrl,
      latestRanking: {
        openaiRank: mainBusinessLatestRanking.openaiRank,
        claudeRank: mainBusinessLatestRanking.claudeRank,
        perplexityRank: mainBusinessLatestRanking.perplexityRank,
        averageRank: mainBusinessLatestRanking.averageRank,
        lastUpdated: mainBusinessLatestRanking.createdAt.toISOString()
      }
    } : null;

    return NextResponse.json({ 
      rankings: allRankings,
      competitors: competitorMetadata,
      mainBusiness: mainBusinessInfo,
      mainBusinessId: businessId
    });

  } catch (error) {
    console.error('Error fetching competitor rankings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
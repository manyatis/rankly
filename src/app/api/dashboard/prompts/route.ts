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
    
    if (!businessIdParam) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const businessId = parseInt(businessIdParam);

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

    // Fetch input history (prompts) for the business
    const prompts = await prisma.inputHistory.findMany({
      where: {
        businessId: businessId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        prompts: true,
        keywords: true,
        createdAt: true,
        runUuid: true
      },
      take: 50 // Limit to last 50 analyses
    });

    return NextResponse.json({ prompts });

  } catch (error) {
    console.error('Error fetching prompt history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
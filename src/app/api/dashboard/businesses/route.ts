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
    const organizationIdParam = searchParams.get('organizationId');
    
    if (!organizationIdParam) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const organizationId = parseInt(organizationIdParam);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has access to this organization
    if (user.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Access denied to organization' }, { status: 403 });
    }

    // Fetch businesses for the organization
    const businesses = await prisma.business.findMany({
      where: {
        organizationId: organizationId
      },
      orderBy: {
        websiteName: 'asc'
      }
    });

    return NextResponse.json({ businesses });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = parseInt((await params).businessId);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch business and verify access
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        organizations: {
          include: {
            organization: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!business || !business.organizations.some(org => org.organization.id === user.organizationId)) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 });
    }

    // Fetch the most recent keywords from InputHistory for this business
    const recentInput = await prisma.inputHistory.findFirst({
      where: {
        businessId: businessId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        keywords: true
      }
    });

    // Add keywords to business object
    const businessWithKeywords = {
      ...business,
      recentKeywords: recentInput?.keywords || []
    };

    return NextResponse.json({ business: businessWithKeywords });

  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } 
}

export async function PUT(
  _request: NextRequest, // eslint-disable-line @typescript-eslint/no-unused-vars
  { params: _params }: { params: Promise<{ businessId: string }> } // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  // Business information is now immutable - editing disabled
  return NextResponse.json(
    { error: 'Business information cannot be modified. Businesses are now immutable to ensure data consistency across organizations.' },
    { status: 405 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = parseInt((await params).businessId);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify business exists and user has access
    const existingBusiness = await prisma.business.findUnique({
      where: { id: businessId },
      include: { 
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!existingBusiness || !existingBusiness.organizations.some(org => org.organization.id === user.organizationId)) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 });
    }

    // Get the user's organization from the business relationships
    const userOrganization = existingBusiness.organizations.find(org => org.organization.id === user.organizationId);

    if (!userOrganization) {
      return NextResponse.json({ error: 'Organization relationship not found' }, { status: 404 });
    }

    // Unlink business from organization instead of deleting
    await prisma.$transaction(async (tx) => {
      // Remove the organization-business relationship
      await tx.organizationBusiness.delete({
        where: {
          organizationId_businessId: {
            organizationId: userOrganization.organization.id,
            businessId: businessId
          }
        }
      });

      // Decrement organization website count
      await tx.organization.update({
        where: { id: userOrganization.organization.id },
        data: { websiteCount: { decrement: 1 } }
      });

      // Note: The business remains in the database with all its ranking history
      // This allows other organizations to track the same website and inherit the data
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Business unlinked from your organization successfully. The business data is preserved for other organizations.' 
    });

  } catch (error) {
    console.error('Error unlinking business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
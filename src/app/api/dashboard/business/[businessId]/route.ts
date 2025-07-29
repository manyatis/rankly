import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = parseInt(params.businessId);

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
        organization: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!business || business.organization.id !== user.organizationId) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ business });

  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = parseInt(params.businessId);
    const body = await request.json();

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
      include: { organization: true }
    });

    if (!existingBusiness || existingBusiness.organization.id !== user.organizationId) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 });
    }

    // Validate input
    const { websiteName, websiteUrl, industry, location, description } = body;

    if (!websiteName?.trim()) {
      return NextResponse.json({ error: 'Website name is required' }, { status: 400 });
    }

    // Check for duplicate website name within the organization (excluding current business)
    const duplicateBusiness = await prisma.business.findFirst({
      where: {
        websiteName: websiteName.trim(),
        organizationId: user.organizationId,
        id: {
          not: businessId
        }
      }
    });

    if (duplicateBusiness) {
      return NextResponse.json({ 
        error: 'A business with this website name already exists in your organization' 
      }, { status: 400 });
    }

    // Update business
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        websiteName: websiteName.trim(),
        websiteUrl: websiteUrl?.trim() || null,
        industry: industry?.trim() || null,
        location: location?.trim() || null,
        description: description?.trim() || null,
      },
      include: {
        organization: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ business: updatedBusiness });

  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
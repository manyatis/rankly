import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { websiteName, websiteUrl, industry, location, description } = body;

    // Validate required fields
    if (!websiteName?.trim()) {
      return NextResponse.json({ error: 'Website name is required' }, { status: 400 });
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Business description is required' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'User must belong to an organization' }, { status: 400 });
    }

    // Check for duplicate website name within the organization
    const existingBusiness = await prisma.business.findFirst({
      where: {
        websiteName: websiteName.trim(),
        organizationId: user.organizationId
      }
    });

    if (existingBusiness) {
      return NextResponse.json({ 
        error: 'A business with this website name already exists in your organization' 
      }, { status: 400 });
    }

    // Create the business
    const business = await prisma.business.create({
      data: {
        websiteName: websiteName.trim(),
        websiteUrl: websiteUrl?.trim() || null,
        industry: industry?.trim() || null,
        location: location?.trim() || null,
        description: description?.trim(),
        organizationId: user.organizationId,
        userId: user.id,
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

    return NextResponse.json({ business }, { status: 201 });

  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
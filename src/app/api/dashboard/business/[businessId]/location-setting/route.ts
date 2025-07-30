import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = parseInt((await params).businessId);
    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { useLocationInAnalysis } = body;

    if (typeof useLocationInAnalysis !== 'boolean') {
      return NextResponse.json({ error: 'useLocationInAnalysis must be a boolean' }, { status: 400 });
    }

    // Get user record
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User not found or no organization' }, { status: 404 });
    }

    // Verify user has access to this business through their organization
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        organizations: {
          some: {
            organizationId: user.organizationId
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 });
    }

    // Update the location setting
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: { useLocationInAnalysis },
      select: { useLocationInAnalysis: true }
    });

    console.log(`✅ Updated location setting for business ${businessId}: useLocationInAnalysis=${useLocationInAnalysis}`);

    return NextResponse.json({
      success: true,
      useLocationInAnalysis: updatedBusiness.useLocationInAnalysis
    });

  } catch (error) {
    console.error('❌ Error updating location setting:', error);
    return NextResponse.json(
      { error: 'Failed to update location setting' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { SubscriptionTiers } from '@/lib/subscription-tiers';


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

    // Get user with organization data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.organizationId || !user.organization) {
      return NextResponse.json({ error: 'User must belong to an organization' }, { status: 400 });
    }

    // Check website limit based on user's subscription tier
    const canAddWebsite = SubscriptionTiers.canAddWebsite(
      user.organization.websiteCount, 
      user.subscriptionTier
    );

    if (!canAddWebsite) {
      const tier = SubscriptionTiers.getTier(user.subscriptionTier);
      return NextResponse.json({ 
        error: `Website limit reached. Your ${tier.name} plan allows ${tier.websiteLimit} website${tier.websiteLimit !== 1 ? 's' : ''}. Please upgrade to add more websites.`
      }, { status: 403 });
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

    // Create the business and increment organization website count
    const business = await prisma.$transaction(async (tx) => {
      // Create the business
      const newBusiness = await tx.business.create({
        data: {
          websiteName: websiteName.trim(),
          websiteUrl: websiteUrl?.trim() || null,
          industry: industry?.trim() || null,
          location: location?.trim() || null,
          description: description?.trim(),
          organizationId: user.organizationId!,
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

      // Increment organization website count
      await tx.organization.update({
        where: { id: user.organizationId! },
        data: { websiteCount: { increment: 1 } }
      });

      return newBusiness;
    });

    return NextResponse.json({ business }, { status: 201 });

  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } 
}
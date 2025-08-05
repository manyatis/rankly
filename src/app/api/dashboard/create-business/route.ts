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

    // Check for duplicate website URL globally (since businesses are now URL-driven)
    let existingBusiness = null;
    if (websiteUrl?.trim()) {
      existingBusiness = await prisma.business.findUnique({
        where: {
          websiteUrl: websiteUrl.trim()
        }
      });
    }

    if (existingBusiness) {
      // Check if this business is already linked to this organization
      const existingLink = await prisma.organizationBusiness.findUnique({
        where: {
          organizationId_businessId: {
            organizationId: user.organizationId!,
            businessId: existingBusiness.id
          }
        }
      });

      if (existingLink) {
        return NextResponse.json({ 
          error: 'This website is already tracked in your organization' 
        }, { status: 400 });
      } else {
        // Business exists but not linked to this organization - allow linking
        await prisma.organizationBusiness.create({
          data: {
            organizationId: user.organizationId!,
            businessId: existingBusiness.id,
            role: 'owner'
          }
        });

        return NextResponse.json({ 
          message: 'Website linked to your organization successfully',
          business: existingBusiness
        });
      }
    }

    // Create the business and link to organization
    const business = await prisma.$transaction(async (tx) => {
      // Create the business
      const newBusiness = await tx.business.create({
        data: {
          websiteName: websiteName.trim(),
          websiteUrl: websiteUrl?.trim() || null,
          industry: industry?.trim() || null,
          location: location?.trim() || null,
          description: description?.trim(),
          userId: user.id,
          isCompetitor: false
        }
      });

      // Link business to organization
      await tx.organizationBusiness.create({
        data: {
          organizationId: user.organizationId!,
          businessId: newBusiness.id,
          role: 'owner'
        }
      });

      // Increment organization website count
      await tx.organization.update({
        where: { id: user.organizationId! },
        data: { websiteCount: { increment: 1 } }
      });

      // Return business with organization link
      const businessWithOrg = await tx.business.findUnique({
        where: { id: newBusiness.id },
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

      return businessWithOrg;
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
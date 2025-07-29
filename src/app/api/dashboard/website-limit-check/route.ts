import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { SubscriptionTiers } from '@/lib/subscription-tiers';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with organization data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: true
      }
    });

    if (!user || !user.organization) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }

    const tier = SubscriptionTiers.getTier(user.subscriptionTier);
    const canAdd = SubscriptionTiers.canAddWebsite(user.organization.websiteCount, user.subscriptionTier);
    const remainingSlots = SubscriptionTiers.getRemainingSlots(user.organization.websiteCount, user.subscriptionTier);

    return NextResponse.json({
      canAddWebsite: canAdd,
      currentCount: user.organization.websiteCount,
      limit: tier.websiteLimit,
      remainingSlots,
      tier: tier.name,
      isUnlimited: tier.websiteLimit === -1
    });

  } catch (error) {
    console.error('Error checking website limit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
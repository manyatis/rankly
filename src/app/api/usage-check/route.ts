import { NextResponse } from 'next/server';
import { getUser, checkUsageLimit, checkRateLimit } from '@/lib/auth';
import { SubscriptionTiers } from '@/lib/subscription-tiers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') as 'analyzeWebsite' | 'generatePrompts' | null;
    const checkWebsiteLimit = searchParams.get('checkWebsiteLimit') === 'true';

    // Get user details with organization
    const dbUser = await prisma.user.findFirst({
      where: { email: user.email },
      include: {
        organization: {
          include: {
            businesses: true
          }
        }
      }
    });

    if (!dbUser || !dbUser.organization) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }

    const tier = dbUser.plan;
    const usageLimits = SubscriptionTiers.getUsageLimits(tier);
    
    // Check daily usage limits
    const usageInfo = await checkUsageLimit(user.email);
    
    // Check rate limits if action specified
    let rateLimitInfo = null;
    if (action) {
      rateLimitInfo = await checkRateLimit(user.email, action);
    }

    // Check website limits if requested
    let websiteInfo = null;
    if (checkWebsiteLimit) {
      const currentWebsiteCount = dbUser.organization.businesses.length;
      const canAddWebsite = SubscriptionTiers.canAddWebsite(currentWebsiteCount, tier);
      const remainingSlots = SubscriptionTiers.getRemainingSlots(currentWebsiteCount, tier);
      
      websiteInfo = {
        currentCount: currentWebsiteCount,
        limit: SubscriptionTiers.getTier(tier).websiteLimit,
        canAdd: canAddWebsite,
        remaining: remainingSlots
      };
    }

    return NextResponse.json({
      // Legacy usage info (maintain backward compatibility)
      canUse: usageInfo.canUse,
      usageCount: usageInfo.usageCount,
      maxUsage: usageInfo.maxUsage,
      tier: usageInfo.tier,
      
      // Enhanced validation info
      dailyUsage: {
        canUse: usageInfo.canUse,
        current: usageInfo.usageCount,
        limit: usageLimits.dailyAnalysisLimit,
        isUnlimited: usageLimits.isUnlimited
      },
      
      rateLimit: rateLimitInfo ? {
        canUse: rateLimitInfo.canUse,
        remaining: rateLimitInfo.remainingUses,
        resetTime: rateLimitInfo.resetTime,
        waitMinutes: rateLimitInfo.waitMinutes
      } : null,
      
      websites: websiteInfo,
      
      features: {
        recurringScans: SubscriptionTiers.hasFeature(tier, 'recurring_scans'),
        dailyScans: SubscriptionTiers.hasFeature(tier, 'daily_scans'),
        apiAccess: SubscriptionTiers.hasFeature(tier, 'api_access')
      }
    });
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
  }
}
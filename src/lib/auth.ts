import { getServerSession } from 'next-auth';
import { authOptions } from './nextauth';
import { prisma } from './prisma';
import { SubscriptionTiers } from './subscription-tiers';
import { SubscriptionStatus } from '@/types/subscription';


export async function getUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function checkUsageLimit(email: string): Promise<{ canUse: boolean; usageCount: number; maxUsage: number | string; tier: string }> {
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user) {
    const freeLimit = SubscriptionTiers.FREE.usageLimits.dailyAnalysisLimit!;
    return { canUse: false, usageCount: 0, maxUsage: freeLimit, tier: 'free' };
  }

  // Check if user has a canceled subscription that's still active
  let effectivePlan = user.plan;
  if (user.subscriptionStatus === SubscriptionStatus.CANCELED && user.subscriptionEndDate) {
    const now = new Date();
    if (now > user.subscriptionEndDate) {
      // Subscription period has ended, use free tier
      effectivePlan = 'free';
    }
    // Otherwise, keep their current plan until subscriptionEndDate
  }

  // Get tier-specific usage limits
  const usageLimits = SubscriptionTiers.getUsageLimits(effectivePlan);
  
  // Professional and Enterprise users get unlimited usage
  if (usageLimits.isUnlimited) {
    return { canUse: true, usageCount: user.dailyUsageCount, maxUsage: 'unlimited', tier: effectivePlan };
  }

  const dailyLimit = usageLimits.dailyAnalysisLimit!;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if last usage was today
  const lastUsageDate = user.lastUsageDate ? new Date(user.lastUsageDate) : null;
  const lastUsageToday = lastUsageDate && lastUsageDate >= today;

  // Reset count if it's a new day
  if (!lastUsageToday) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyUsageCount: 0,
        lastUsageDate: new Date()
      }
    });
    return { canUse: true, usageCount: 0, maxUsage: dailyLimit, tier: effectivePlan };
  }

  const canUse = user.dailyUsageCount < dailyLimit;
  return { canUse, usageCount: user.dailyUsageCount, maxUsage: dailyLimit, tier: effectivePlan };
}

export async function incrementUsage(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      return false;
    }

    // Check if user has a canceled subscription that's still active
    let effectivePlan = user.plan;
    if (user.subscriptionStatus === SubscriptionStatus.CANCELED && user.subscriptionEndDate) {
      const now = new Date();
      if (now > user.subscriptionEndDate) {
        // Subscription period has ended, use free tier
        effectivePlan = 'free';
      }
    }

    // Get tier-specific usage limits
    const usageLimits = SubscriptionTiers.getUsageLimits(effectivePlan);

    // Professional and Enterprise users get unlimited usage
    if (usageLimits.isUnlimited) {
      // Still increment for tracking, but always allow usage
      await prisma.user.update({
        where: { id: user.id },
        data: {
          dailyUsageCount: user.dailyUsageCount + 1,
          lastUsageDate: new Date()
        }
      });
      return true;
    }

    const dailyLimit = usageLimits.dailyAnalysisLimit!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if last usage was today
    const lastUsageDate = user.lastUsageDate ? new Date(user.lastUsageDate) : null;
    const lastUsageToday = lastUsageDate && lastUsageDate >= today;

    // Reset or increment count
    const newCount = lastUsageToday ? user.dailyUsageCount + 1 : 1;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyUsageCount: newCount,
        lastUsageDate: new Date()
      }
    });

    return newCount <= dailyLimit;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return false;
  }
}

export async function createSession(email: string) {
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      dailyUsageCount: 0,
      plan: 'free'
    }
  });

  const sessionToken = crypto.randomUUID();
  const expires = new Date();
  expires.setDate(expires.getDate() + 30); // 30 days

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires
    }
  });

  return { token: sessionToken, user };
}

export async function checkRateLimit(
  email: string, 
  action: 'analyzeWebsite' | 'generatePrompts'
): Promise<{ canUse: boolean; remainingUses: number; resetTime: Date | null; waitMinutes: number }> {
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user) {
    return { canUse: false, remainingUses: 0, resetTime: null, waitMinutes: 0 };
  }

  // Check if user has a canceled subscription that's still active
  let effectivePlan = user.plan;
  if (user.subscriptionStatus === SubscriptionStatus.CANCELED && user.subscriptionEndDate) {
    const now = new Date();
    if (now > user.subscriptionEndDate) {
      // Subscription period has ended, use free tier
      effectivePlan = 'free';
    }
  }

  // Get tier-specific rate limits
  const usageLimits = SubscriptionTiers.getUsageLimits(effectivePlan);

  // Professional and Enterprise users get unlimited usage
  if (usageLimits.isUnlimited) {
    return { canUse: true, remainingUses: 999, resetTime: null, waitMinutes: 0 };
  }

  const rateLimit = usageLimits.rateLimitPerWindow;
  const now = new Date();
  
  let count: number;
  let resetTime: Date | null;
  
  if (action === 'analyzeWebsite') {
    count = user.analyzeWebsiteCount;
    resetTime = user.analyzeWebsiteResetTime;
  } else {
    count = user.generatePromptsCount;
    resetTime = user.generatePromptsResetTime;
  }

  // If no reset time set or reset time has passed, reset the counter
  if (!resetTime || now >= resetTime) {
    return { canUse: true, remainingUses: rateLimit - 1, resetTime: null, waitMinutes: 0 };
  }

  // If within the 5-minute window
  if (count >= rateLimit) {
    const waitMs = resetTime.getTime() - now.getTime();
    const waitMinutes = Math.ceil(waitMs / (60 * 1000));
    return { canUse: false, remainingUses: 0, resetTime, waitMinutes };
  }

  return { canUse: true, remainingUses: rateLimit - count, resetTime, waitMinutes: 0 };
}

export async function incrementRateLimit(
  email: string, 
  action: 'analyzeWebsite' | 'generatePrompts'
): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      return false;
    }

    // Check if user has a canceled subscription that's still active
    let effectivePlan = user.plan;
    if (user.subscriptionStatus === SubscriptionStatus.CANCELED && user.subscriptionEndDate) {
      const now = new Date();
      if (now > user.subscriptionEndDate) {
        // Subscription period has ended, use free tier
        effectivePlan = 'free';
      }
    }

    // Get tier-specific rate limits
    const usageLimits = SubscriptionTiers.getUsageLimits(effectivePlan);

    // Professional and Enterprise users get unlimited usage
    if (usageLimits.isUnlimited) {
      return true;
    }

    const rateLimit = usageLimits.rateLimitPerWindow;
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    let count: number;
    let resetTime: Date | null;
    
    if (action === 'analyzeWebsite') {
      count = user.analyzeWebsiteCount;
      resetTime = user.analyzeWebsiteResetTime;
    } else {
      count = user.generatePromptsCount;
      resetTime = user.generatePromptsResetTime;
    }

    // If no reset time set or reset time has passed, start new window
    if (!resetTime || now >= resetTime) {
      const updateData = action === 'analyzeWebsite' 
        ? { analyzeWebsiteCount: 1, analyzeWebsiteResetTime: fiveMinutesFromNow }
        : { generatePromptsCount: 1, generatePromptsResetTime: fiveMinutesFromNow };
      
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
      return true;
    }

    // If within window and under limit, increment
    if (count < rateLimit) {
      const updateData = action === 'analyzeWebsite' 
        ? { analyzeWebsiteCount: count + 1 }
        : { generatePromptsCount: count + 1 };
      
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
      return true;
    }

    // Rate limit exceeded
    return false;
  } catch (error) {
    console.error('Error incrementing rate limit:', error);
    return false;
  }
}
import { getServerSession } from 'next-auth';
import { authOptions } from './nextauth';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function getUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function checkUsageLimit(email: string): Promise<{ canUse: boolean; usageCount: number; maxUsage: number | string; tier: string }> {
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user) {
    return { canUse: false, usageCount: 0, maxUsage: 2, tier: 'free' };
  }

  // Professional and Enterprise users get unlimited usage
  if (user.plan === 'professional' || user.plan === 'enterprise') {
    return { canUse: true, usageCount: user.dailyUsageCount, maxUsage: 'unlimited', tier: user.plan };
  }

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
    return { canUse: true, usageCount: 0, maxUsage: 2, tier: user.plan };
  }

  const canUse = user.dailyUsageCount < 2;
  return { canUse, usageCount: user.dailyUsageCount, maxUsage: 2, tier: user.plan };
}

export async function incrementUsage(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      return false;
    }

    // Professional and Enterprise users get unlimited usage
    if (user.plan === 'professional' || user.plan === 'enterprise') {
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

    return newCount <= 2;
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
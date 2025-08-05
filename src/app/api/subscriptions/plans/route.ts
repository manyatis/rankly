import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceCents: 'asc' },
      select: {
        id: true,
        planId: true,
        name: true,
        priceCents: true,
        billingPeriod: true,
        features: true,
        description: true
      }
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('❌ Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
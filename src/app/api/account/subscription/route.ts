import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import { prisma as db } from '@/lib/prisma'
import { SubscriptionStatus } from '@/types/subscription'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subscription plan details if user has a subscription
    let subscriptionPlan = null
    if (user.plan && user.plan !== 'free') {
      subscriptionPlan = await db.subscriptionPlan.findUnique({
        where: { planId: user.plan }
      })
    }

    // If user has no subscription plan, return free tier info
    if (!subscriptionPlan) {
      return NextResponse.json({
        plan: {
          name: 'Free',
          price: 0,
          features: [
            '1 AEO analysis per day',
            'Basic website insights',
            'Limited competitor tracking'
          ]
        },
        status: SubscriptionStatus.FREE,
        startDate: user.createdAt.toISOString()
      })
    }

    // Calculate next billing date if subscription is active
    let nextBillingDate
    if (user.subscriptionStatus === SubscriptionStatus.ACTIVE && user.subscriptionStartDate) {
      const startDate = new Date(user.subscriptionStartDate)
      const now = new Date()
      const monthsSinceStart = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                               (now.getMonth() - startDate.getMonth())
      
      nextBillingDate = new Date(startDate)
      nextBillingDate.setMonth(startDate.getMonth() + monthsSinceStart + 1)
    }

    return NextResponse.json({
      plan: {
        name: subscriptionPlan.name,
        price: subscriptionPlan.priceCents / 100, // Convert cents to dollars
        features: subscriptionPlan.features
      },
      status: user.subscriptionStatus || SubscriptionStatus.INACTIVE,
      startDate: user.subscriptionStartDate?.toISOString() || user.createdAt.toISOString(),
      nextBillingDate: nextBillingDate?.toISOString(),
      subscriptionId: user.subscriptionId
    })
  } catch (error) {
    console.error('Error fetching subscription data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    )
  }
}
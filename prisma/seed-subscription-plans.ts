import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');

  // Delete existing plans to start fresh
  await prisma.subscriptionPlan.deleteMany();

  // Create subscription plans
  const plans = [
    {
      planId: 'indie',
      name: 'Indie',
      priceCents: 2000, // $20.00
      billingPeriod: 'month',
      description: 'Perfect for indie developers and small projects',
      features: [
        '1 website with daily scan',
        'Advanced AEO analysis',
        '3 manual scans per week',
        'Detailed insights',
        'Query results visibility'
      ],
      isActive: true,
      stripePriceId: null, // Will be set when Stripe products are created
      stripeProductId: null,
    },
    {
      planId: 'professional',
      name: 'Professional',
      priceCents: 10000, // $100.00
      billingPeriod: 'month',
      description: 'Ideal for growing businesses and agencies',
      features: [
        'Up to 5 websites with daily scans',
        'Premium AEO analysis',
        '10 manual scans per week',
        'Daily recurring scans',
        'AI-powered insights',
        'Competitor tracking',
        'Priority support'
      ],
      isActive: true,
      stripePriceId: null, // Will be set when Stripe products are created
      stripeProductId: null,
    },
    {
      planId: 'enterprise',
      name: 'Enterprise',
      priceCents: 30000, // $300.00
      billingPeriod: 'month',
      description: 'Advanced features for large organizations',
      features: [
        'Unlimited websites with daily scans',
        'Enterprise AEO analysis',
        '100 manual scans per week',
        'Custom scan frequency',
        'Advanced AI insights',
        'Expert consultation',
        'Dedicated support',
        'White-label reports',
        'API access'
      ],
      isActive: true,
      stripePriceId: null, // Will be set when Stripe products are created
      stripeProductId: null,
    }
  ];

  for (const plan of plans) {
    const created = await prisma.subscriptionPlan.create({
      data: plan
    });
    console.log(`✅ Created plan: ${created.name} (${created.planId})`);
  }

  console.log('🎉 Subscription plans seeded successfully!');
}

seedSubscriptionPlans()
  .catch((e) => {
    console.error('❌ Error seeding subscription plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
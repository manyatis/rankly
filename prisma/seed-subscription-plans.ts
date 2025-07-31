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
      priceCents: 1000, // $10.00 (SALE PRICE)
      billingPeriod: 'month',
      description: 'Perfect for indie developers and small projects',
      features: [
        '3 websites',
        'Advanced AEO analysis',
        'Recurring scans (daily/weekly/monthly)',
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
      priceCents: 3500, // $35.00 (SALE PRICE)
      billingPeriod: 'month',
      description: 'Ideal for growing businesses and agencies',
      features: [
        '10 websites',
        'Premium AEO analysis',
        'Unlimited manual scans',
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
      priceCents: 12500, // $125.00 (SALE PRICE)
      billingPeriod: 'month',
      description: 'Advanced features for large organizations',
      features: [
        'Unlimited websites',
        'Enterprise AEO analysis',
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
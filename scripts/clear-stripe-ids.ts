import { prisma } from '../src/lib/prisma';

async function clearStripeIds() {
  console.log('🧹 Clearing test Stripe IDs from database...');

  try {
    // Clear all Stripe product and price IDs
    const result = await prisma.subscriptionPlan.updateMany({
      data: {
        stripePriceId: null,
        stripeProductId: null
      }
    });

    console.log(`✅ Cleared Stripe IDs from ${result.count} subscription plans`);

    // Show current state
    const plans = await prisma.subscriptionPlan.findMany({
      select: {
        name: true,
        stripePriceId: true,
        stripeProductId: true
      }
    });

    console.log('\n📊 Current state:');
    for (const plan of plans) {
      console.log(`  ${plan.name}:`);
      console.log(`    Product ID: ${plan.stripeProductId || 'NOT SET'}`);
      console.log(`    Price ID: ${plan.stripePriceId || 'NOT SET'}`);
    }

    console.log('\n🎉 Ready to run setup-stripe-products again!');

  } catch (error) {
    console.error('❌ Error clearing Stripe IDs:', error);
    process.exit(1);
  }
}

// Run the cleanup
clearStripeIds()
  .then(() => {
    console.log('\n✨ Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
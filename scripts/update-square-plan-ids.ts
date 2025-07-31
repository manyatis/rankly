import { prisma } from '../src/lib/prisma';

// These IDs need to be obtained from your Square Dashboard
// Go to Square Dashboard > Items > Subscriptions to find the plan variation IDs
const SQUARE_PLAN_IDS = {
  indie: 'YOUR_INDIE_PLAN_VARIATION_ID',      // Replace with actual ID
  professional: 'YOUR_PROFESSIONAL_PLAN_ID',   // Replace with actual ID
  enterprise: 'YOUR_ENTERPRISE_PLAN_ID'        // Replace with actual ID
};

async function updateSquarePlanIds() {
  console.log('🔧 Updating Square plan IDs in database...\n');

  console.log('⚠️  IMPORTANT: You need to get the plan variation IDs from Square Dashboard');
  console.log('📍 Go to: https://squareup.com/dashboard/items/library/subscriptions');
  console.log('📝 Copy the variation IDs for each plan and update this script\n');

  // Check if IDs are still placeholder values
  const hasPlaceholders = Object.values(SQUARE_PLAN_IDS).some(id => id.includes('YOUR_'));
  if (hasPlaceholders) {
    console.error('❌ Please update SQUARE_PLAN_IDS with actual values from Square Dashboard');
    console.log('\nTo get the plan variation IDs:');
    console.log('1. Log in to Square Dashboard');
    console.log('2. Go to Items > Subscriptions');
    console.log('3. Click on each subscription plan');
    console.log('4. Copy the "Variation ID" (looks like: 6JHZQW7IXDTB4OIIMJLRCRNI)');
    console.log('5. Update this script with those IDs\n');
    process.exit(1);
  }

  try {
    for (const [planId, squarePlanId] of Object.entries(SQUARE_PLAN_IDS)) {
      console.log(`📝 Updating ${planId} plan...`);
      
      const updated = await prisma.subscriptionPlan.update({
        where: { planId },
        data: { squarePlanId }
      });
      
      console.log(`✅ Updated ${updated.name}: ${squarePlanId}`);
    }

    console.log('\n🎉 All plans updated successfully!');
    
    // Display current state
    console.log('\n📊 Current subscription plans:');
    const plans = await prisma.subscriptionPlan.findMany();
    for (const plan of plans) {
      console.log(`  ${plan.name} (${plan.planId}): ${plan.squarePlanId || 'NOT SET'}`);
    }

  } catch (error) {
    console.error('❌ Error updating plans:', error);
    process.exit(1);
  }
}

updateSquarePlanIds()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
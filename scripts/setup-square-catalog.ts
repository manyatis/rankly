import { catalogApi } from '../src/lib/square';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

async function setupSquareCatalog() {
  console.log('🔧 Setting up Square catalog items for subscription plans...');

  try {
    // Fetch existing plans from database
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true }
    });

    if (plans.length === 0) {
      console.error('❌ No subscription plans found in database. Run seed-subscription-plans.ts first.');
      process.exit(1);
    }

    console.log(`📋 Found ${plans.length} plans to create in Square`);

    for (const plan of plans) {
      console.log(`\n🔄 Processing ${plan.name} plan...`);

      // Create subscription plan in Square Catalog
      const catalogRequest = {
        idempotencyKey: randomUUID(),
        object: {
          type: 'SUBSCRIPTION_PLAN' as const,
          id: `#${plan.planId}_plan`,
          subscriptionPlanData: {
            name: `Rankly ${plan.name} Plan`,
            phases: [
              {
                cadence: plan.billingPeriod.toUpperCase() as 'MONTHLY',
                periods: undefined, // Infinite periods
                recurringPriceMoney: {
                  amount: BigInt(plan.priceCents),
                  currency: 'USD'
                }
              }
            ]
          }
        }
      };

      try {
        console.log('📤 Creating catalog item in Square...');
        const response = await catalogApi.upsertCatalogObject(catalogRequest);

        if (response.errors && response.errors.length > 0) {
          console.error(`❌ Square API errors for ${plan.name}:`, response.errors);
          continue;
        }

        const catalogObject = response.catalogObject;
        if (!catalogObject) {
          console.error(`❌ No catalog object returned for ${plan.name}`);
          continue;
        }

        // The plan variation ID is in the subscription plan data
        const planVariationId = catalogObject.id;
        
        console.log(`✅ Created Square catalog item: ${catalogObject.id}`);
        console.log(`📝 Plan variation ID: ${planVariationId}`);

        // Update database with Square plan ID
        await prisma.subscriptionPlan.update({
          where: { id: plan.id },
          data: { squarePlanId: planVariationId }
        });

        console.log(`✅ Updated database for ${plan.name} plan`);

      } catch (error) {
        console.error(`❌ Error creating Square catalog item for ${plan.name}:`, error);
      }
    }

    // Verify all plans have Square IDs
    const updatedPlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true }
    });

    const missingSquareIds = updatedPlans.filter(p => !p.squarePlanId);
    if (missingSquareIds.length > 0) {
      console.warn(`\n⚠️  ${missingSquareIds.length} plans still missing Square IDs:`);
      missingSquareIds.forEach(p => console.warn(`  - ${p.name}`));
    } else {
      console.log('\n🎉 All plans successfully configured with Square catalog IDs!');
    }

    // Display summary
    console.log('\n📊 Summary:');
    for (const plan of updatedPlans) {
      console.log(`  ${plan.name}: ${plan.squarePlanId || 'NOT SET'}`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Add environment check
if (!process.env.SQUARE_ACCESS_TOKEN) {
  console.error('❌ SQUARE_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

if (!process.env.SQUARE_LOCATION_ID) {
  console.error('❌ SQUARE_LOCATION_ID environment variable is required');
  process.exit(1);
}

// Run the setup
setupSquareCatalog()
  .then(() => {
    console.log('\n✨ Square catalog setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
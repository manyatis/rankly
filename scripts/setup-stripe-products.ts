import Stripe from 'stripe';
import { prisma } from '../src/lib/prisma';

// Hardcode your Stripe secret key here
const STRIPE_SECRET_KEY = 'sk_test_51Rqmd1RdBVc2VZ7lzF80zy8sqC39MQjm3DeO86sco56hRwflHmkSZ2LFmxFLVg9jNDxzkb4jsnbDD3MLSFUNxGFX00BPhdKtGJ';

// Create Stripe instance with hardcoded key
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

async function setupStripeProducts() {
  console.log('🔧 Setting up Stripe products and prices...');

  try {
    // Fetch existing plans from database
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true }
    });

    if (plans.length === 0) {
      console.error('❌ No subscription plans found in database. Run seed-subscription-plans.ts first.');
      process.exit(1);
    }

    console.log(`📋 Found ${plans.length} plans to create in Stripe`);

    for (const plan of plans) {
      console.log(`\n🔄 Processing ${plan.name} plan...`);

      // Skip if already has Stripe IDs
      if (plan.stripePriceId && plan.stripeProductId) {
        console.log(`✅ ${plan.name} already configured with Stripe IDs`);
        continue;
      }

      // Create product in Stripe
      console.log('📦 Creating Stripe product...');
      const product = await stripe.products.create({
        name: `Rankly ${plan.name} Plan`,
        description: plan.description || `${plan.name} subscription plan for Rankly`,
        metadata: {
          planId: plan.planId,
        }
      });

      console.log(`✅ Product created: ${product.id}`);

      // Create price in Stripe
      console.log('💰 Creating Stripe price...');
      const price = await stripe.prices.create({
        unit_amount: plan.priceCents,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        product: product.id,
        metadata: {
          planId: plan.planId,
        }
      });

      console.log(`✅ Price created: ${price.id}`);

      // Update database with Stripe IDs
      await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: { 
          stripePriceId: price.id,
          stripeProductId: product.id
        }
      });

      console.log(`✅ Updated database for ${plan.name} plan`);
    }

    // Display summary
    console.log('\n📊 Summary:');
    const updatedPlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true }
    });
    
    for (const plan of updatedPlans) {
      console.log(`  ${plan.name}:`);
      console.log(`    Product ID: ${plan.stripeProductId || 'NOT SET'}`);
      console.log(`    Price ID: ${plan.stripePriceId || 'NOT SET'}`);
    }

    console.log('\n🎉 Stripe products and prices setup complete!');

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error);
    process.exit(1);
  }
}

// Validate key format
if (!STRIPE_SECRET_KEY.startsWith('sk_')) {
  console.error('❌ Invalid Stripe secret key format');
  console.log('Stripe secret keys should start with sk_test_ or sk_live_');
  process.exit(1);
}

// Run the setup
setupStripeProducts()
  .then(() => {
    console.log('\n✨ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
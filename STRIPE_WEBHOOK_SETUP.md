# Stripe Webhook Setup

## Overview
Your subscription system now uses **Stripe Checkout Sessions** for a much simpler and more reliable payment flow. Configure your webhook to handle these events:

## Required Events

In your Stripe Dashboard:
1. Go to Developers → Webhooks
2. Add endpoint or update existing endpoint
3. Set endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select the following events:

### Primary Events (for Checkout flow)
- `checkout.session.completed` - **MOST IMPORTANT** - Handles successful subscription creation
- `customer.subscription.updated` - Handles subscription changes (upgrades, cancellations)
- `customer.subscription.deleted` - Handles subscription cancellations

### Optional Events (for additional functionality)
- `invoice.payment_succeeded` - Monthly recurring payments
- `invoice.payment_failed` - Failed recurring payments
- `customer.subscription.created` - Subscription creation (redundant with checkout.session.completed)

## Testing Locally

For local testing with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret and add to your `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## How the New Flow Works

1. **User clicks subscribe** → Creates Checkout Session via `/api/subscriptions/create-stripe`
2. **User redirected to Stripe Checkout** → Stripe handles all payment complexity
3. **User completes payment** → Stripe fires `checkout.session.completed` webhook
4. **Webhook activates subscription** → User is upgraded to paid plan
5. **User redirected to success page** → `/subscribe/success`

## Benefits of Checkout Sessions

✅ **No client secret handling**  
✅ **Automatic 3D Secure support**  
✅ **Built-in payment retry logic**  
✅ **Support for all payment methods**  
✅ **PCI compliance handled by Stripe**  
✅ **Mobile-optimized checkout**

## Success/Cancel URLs

The system includes dedicated pages:
- Success: `/subscribe/success` - Shows confirmation and redirects to dashboard
- Cancel: `/subscribe/cancel` - Handles cancelled payments with retry option
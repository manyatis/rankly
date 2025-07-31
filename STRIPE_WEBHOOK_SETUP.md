# Stripe Webhook Setup

To ensure payment confirmations work properly, you need to configure your Stripe webhook to listen for the following events:

## Required Events

In your Stripe Dashboard:
1. Go to Developers → Webhooks
2. Add endpoint or update existing endpoint
3. Set endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select the following events:

### Subscription Events (already configured)
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Invoice Events (REQUIRED for payment confirmations)
- `invoice.payment_succeeded` - Confirms successful payment
- `invoice.payment_failed` - Handles failed payments
- `invoice.payment_action_required` - For 3D Secure requirements

## Testing Locally

For local testing with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret and add to your `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Why Invoice Events Matter

When a subscription requires payment confirmation (e.g., 3D Secure cards):
1. Subscription is created with status `incomplete`
2. Customer completes payment authentication
3. Stripe fires `invoice.payment_succeeded` event
4. Your webhook handler upgrades the user to the paid plan

Without invoice events, subscriptions will stay stuck in "incomplete" status even after successful payment.
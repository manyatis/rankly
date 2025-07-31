// Subscription status enum based on Stripe subscription statuses
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  PAUSED = 'paused',
  INACTIVE = 'inactive', // Custom status for users without subscriptions
  FREE = 'free' // Custom status for free tier users
}

// Helper function to check if subscription is active (can access premium features)
export function isActiveSubscription(status: string | null | undefined): boolean {
  return status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING
}

// Helper function to check if subscription allows cancellation
export function canCancelSubscription(status: string | null | undefined): boolean {
  return status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING || status === SubscriptionStatus.PAST_DUE
}

// Helper function to get display-friendly status
export function getStatusDisplay(status: string | null | undefined): string {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'Active'
    case SubscriptionStatus.CANCELED:
      return 'Canceled'
    case SubscriptionStatus.PAST_DUE:
      return 'Past Due'
    case SubscriptionStatus.UNPAID:
      return 'Unpaid'
    case SubscriptionStatus.INCOMPLETE:
      return 'Incomplete'
    case SubscriptionStatus.INCOMPLETE_EXPIRED:
      return 'Incomplete Expired'
    case SubscriptionStatus.TRIALING:
      return 'Trialing'
    case SubscriptionStatus.PAUSED:
      return 'Paused'
    case SubscriptionStatus.INACTIVE:
      return 'Inactive'
    case SubscriptionStatus.FREE:
      return 'Free'
    default:
      return 'Unknown'
  }
}

// Helper function to get status color for UI
export function getStatusColor(status: string | null | undefined): string {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
    case SubscriptionStatus.TRIALING:
      return 'text-green-400'
    case SubscriptionStatus.CANCELED:
    case SubscriptionStatus.UNPAID:
    case SubscriptionStatus.INCOMPLETE_EXPIRED:
      return 'text-red-400'
    case SubscriptionStatus.PAST_DUE:
      return 'text-orange-400'
    case SubscriptionStatus.PAUSED:
      return 'text-yellow-400'
    case SubscriptionStatus.INCOMPLETE:
    case SubscriptionStatus.INACTIVE:
      return 'text-gray-400'
    case SubscriptionStatus.FREE:
      return 'text-blue-400'
    default:
      return 'text-white'
  }
}

// Helper function to get status indicator color
export function getStatusIndicatorColor(status: string | null | undefined): string {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
    case SubscriptionStatus.TRIALING:
      return 'bg-green-500'
    case SubscriptionStatus.CANCELED:
    case SubscriptionStatus.UNPAID:
    case SubscriptionStatus.INCOMPLETE_EXPIRED:
      return 'bg-red-500'
    case SubscriptionStatus.PAST_DUE:
      return 'bg-orange-500'
    case SubscriptionStatus.PAUSED:
      return 'bg-yellow-500'
    case SubscriptionStatus.INCOMPLETE:
    case SubscriptionStatus.INACTIVE:
      return 'bg-gray-600'
    case SubscriptionStatus.FREE:
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}
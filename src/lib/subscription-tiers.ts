export interface SubscriptionTier {
  name: string;
  websiteLimit: number;
  price?: string;
  priceCents?: number; // Price in cents for Square
  features: string[];
  usageLimits: {
    dailyAnalysisLimit: number | null; // null = unlimited
    rateLimitPerWindow: number;
    isUnlimited: boolean;
  };
}

export class SubscriptionTiers {
  static readonly FREE: SubscriptionTier = {
    name: 'Free',
    websiteLimit: 1,
    features: [
      '1 website',
      'Basic AEO analysis',
      'Manual scans only',
      'Basic insights'
    ],
    usageLimits: {
      dailyAnalysisLimit: 2,
      rateLimitPerWindow: 2,
      isUnlimited: false
    }
  };

  static readonly INDIE: SubscriptionTier = {
    name: 'Indie',
    websiteLimit: 3,
    price: '$20/month',
    priceCents: 100, // $20.00 in cents
    features: [
      '3 websites',
      'Advanced AEO analysis',
      'Recurring scans (daily/weekly/monthly)',
      'Detailed insights',
      'Query results visibility'
    ],
    usageLimits: {
      dailyAnalysisLimit: 3,
      rateLimitPerWindow: 5,
      isUnlimited: false
    }
  };

  static readonly PROFESSIONAL: SubscriptionTier = {
    name: 'Professional',
    websiteLimit: 10,
    price: '$75/month',
    priceCents: 7500, // $75.00 in cents
    features: [
      '10 websites',
      'Premium AEO analysis',
      'Unlimited manual scans',
      'Daily recurring scans',
      'AI-powered insights',
      'Competitor tracking',
      'Priority support'
    ],
    usageLimits: {
      dailyAnalysisLimit: null,
      rateLimitPerWindow: 999,
      isUnlimited: true
    }
  };

  static readonly ENTERPRISE: SubscriptionTier = {
    name: 'Enterprise',
    websiteLimit: -1, // -1 represents unlimited
    price: '$250/month',
    priceCents: 25000, // $250.00 in cents
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
    usageLimits: {
      dailyAnalysisLimit: null,
      rateLimitPerWindow: 999,
      isUnlimited: true
    }
  };

  static readonly ALL_TIERS = [
    SubscriptionTiers.FREE,
    SubscriptionTiers.INDIE,
    SubscriptionTiers.PROFESSIONAL,
    SubscriptionTiers.ENTERPRISE
  ];

  /**
   * Get tier by subscription tier string
   */
  static getTier(tierName: string): SubscriptionTier {
    switch (tierName.toLowerCase()) {
      case 'free':
        return SubscriptionTiers.FREE;
      case 'indie':
        return SubscriptionTiers.INDIE;
      case 'professional':
        return SubscriptionTiers.PROFESSIONAL;
      case 'enterprise':
        return SubscriptionTiers.ENTERPRISE;
      default:
        return SubscriptionTiers.FREE; // Default to free tier
    }
  }

  /**
   * Check if organization can add more websites
   */
  static canAddWebsite(currentCount: number, tierName: string): boolean {
    const tier = SubscriptionTiers.getTier(tierName);
    if (tier.websiteLimit === -1) return true; // Unlimited
    return currentCount < tier.websiteLimit;
  }

  /**
   * Get remaining website slots for an organization
   */
  static getRemainingSlots(currentCount: number, tierName: string): number | null {
    const tier = SubscriptionTiers.getTier(tierName);
    if (tier.websiteLimit === -1) return null; // Unlimited
    return Math.max(0, tier.websiteLimit - currentCount);
  }

  /**
   * Check if a feature is available for a tier
   */
  static hasFeature(tierName: string, feature: 'recurring_scans' | 'daily_scans' | 'api_access'): boolean {
    const tier = SubscriptionTiers.getTier(tierName);
    
    switch (feature) {
      case 'recurring_scans':
        return tier.name !== 'Free';
      case 'daily_scans':
        return tier.name === 'Professional' || tier.name === 'Enterprise';
      case 'api_access':
        return tier.name === 'Enterprise';
      default:
        return false;
    }
  }

  /**
   * Get usage limits for a tier
   */
  static getUsageLimits(tierName: string): {
    dailyAnalysisLimit: number | null; // null = unlimited
    rateLimitPerWindow: number;
    isUnlimited: boolean;
  } {
    const tier = SubscriptionTiers.getTier(tierName);
    return tier.usageLimits;
  }
}
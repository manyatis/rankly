export interface SubscriptionTier {
  name: string;
  websiteLimit: number;
  price?: string;
  priceCents?: number; // Price in cents
  features: string[];
  usageLimits: {
    dailyAnalysisLimit: number | null; // null = unlimited
    weeklyManualScans: number | null; // null = unlimited
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
      weeklyManualScans: 2,
      rateLimitPerWindow: 2,
      isUnlimited: false
    }
  };

  static readonly INDIE: SubscriptionTier = {
    name: 'Indie',
    websiteLimit: 1,
    price: '$20/month',
    priceCents: 2000, // $20.00 in cents
    features: [
      '1 website with daily scan',
      'Advanced AEO analysis',
      '3 manual scans per week',
      'Detailed insights',
      'Query results visibility'
    ],
    usageLimits: {
      dailyAnalysisLimit: null, // No daily limit, but weekly limit
      weeklyManualScans: 3,
      rateLimitPerWindow: 5,
      isUnlimited: false
    }
  };

  static readonly PROFESSIONAL: SubscriptionTier = {
    name: 'Professional',
    websiteLimit: 5,
    price: '$100/month',
    priceCents: 10000, // $100.00 in cents
    features: [
      'Up to 5 websites with daily scans',
      'Premium AEO analysis',
      '10 manual scans per week',
      'Daily recurring scans',
      'AI-powered insights',
      'Competitor tracking',
      'Priority support'
    ],
    usageLimits: {
      dailyAnalysisLimit: null, // No daily limit, but weekly limit
      weeklyManualScans: 10,
      rateLimitPerWindow: 10,
      isUnlimited: false
    }
  };

  static readonly ENTERPRISE: SubscriptionTier = {
    name: 'Enterprise',
    websiteLimit: -1, // -1 represents unlimited
    price: '$300/month',
    priceCents: 30000, // $300.00 in cents
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
    usageLimits: {
      dailyAnalysisLimit: null, // No daily limit, but weekly limit
      weeklyManualScans: 100,
      rateLimitPerWindow: 20,
      isUnlimited: false
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
        return tier.name !== 'Free'; // All paid tiers have daily scans
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
    weeklyManualScans: number | null; // null = unlimited
    rateLimitPerWindow: number;
    isUnlimited: boolean;
  } {
    const tier = SubscriptionTiers.getTier(tierName);
    return tier.usageLimits;
  }
}
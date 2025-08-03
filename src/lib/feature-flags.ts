/**
 * Feature flags configuration
 * Controls which features are enabled in the application
 */

export const featureFlags = {
  /**
   * Google AI (Gemini) integration
   * When disabled, Google AI will not be included in AEO analysis
   */
  googleAI: {
    enabled: process.env.FEATURE_FLAG_GOOGLE_AI === 'true',
    name: 'Google AI Integration',
    description: 'Enables Google AI (Gemini) model for AEO analysis'
  },

  /**
   * Text-based ranking engine
   * When enabled, uses non-AI TextRankingEngine instead of AI-based analysis for business mention detection
   */
  textRankingEngine: {
    enabled: process.env.USE_TEXT_RANKING_ENGINE === 'true',
    name: 'Text Ranking Engine',
    description: 'Uses non-AI text analysis for business mention detection and ranking'
  }
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature]?.enabled ?? false;
}

/**
 * Get all feature flags (server-side only)
 */
export function getFeatureFlags(): Record<string, boolean> {
  return Object.entries(featureFlags).reduce((acc, [key, value]) => {
    acc[key] = value.enabled;
    return acc;
  }, {} as Record<string, boolean>);
}
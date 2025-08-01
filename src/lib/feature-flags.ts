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
  }
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature]?.enabled ?? false;
}
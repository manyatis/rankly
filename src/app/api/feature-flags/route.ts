import { NextResponse } from 'next/server';
import { featureFlags } from '@/lib/feature-flags';

/**
 * GET /api/feature-flags
 * Returns the current feature flags configuration
 */
export async function GET() {
  // Only expose the enabled status, not the full configuration
  const flags = Object.entries(featureFlags).reduce((acc, [key, value]) => {
    acc[key] = value.enabled;
    return acc;
  }, {} as Record<string, boolean>);

  return NextResponse.json({ flags });
}
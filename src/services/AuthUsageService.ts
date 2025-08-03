import { getUser, checkUsageLimit } from '../lib/auth';
import { prisma } from '../lib/prisma';

export interface AuthValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
  user?: {
    email: string;
    id: number;
    name?: string | null;
    image?: string | null;
  };
  usageInfo?: {
    usageCount: number;
    maxUsage: number | string;
    canUse: boolean;
    tier: string;
    period?: string;
  };
}

export class AuthUsageService {
  /**
   * Validate authentication and usage limits
   */
  static async validateAuthAndUsage(): Promise<AuthValidationResult> {
    console.debug(`🔐 Validating authentication and usage limits`);

    const user = await getUser();
    if (!user?.email) {
      console.debug(`❌ User not authenticated`);
      return {
        isValid: false,
        error: 'Authentication required',
        statusCode: 401
      };
    }

    const usageInfo = await checkUsageLimit(user.email);
    if (!usageInfo.canUse) {
      console.debug(`❌ Usage limit exceeded for ${user.email}: ${usageInfo.usageCount}/${usageInfo.maxUsage}`);
      return {
        isValid: false,
        error: `Daily limit reached. You've used ${usageInfo.usageCount}/${usageInfo.maxUsage} free analytics today.`,
        statusCode: 429,
        usageInfo
      };
    }

    // Get database user ID
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true }
    });

    if (!dbUser) {
      return {
        isValid: false,
        error: 'User not found in database',
        statusCode: 404
      };
    }

    console.debug(`✅ Authentication and usage validation passed for ${user.email} (${usageInfo.usageCount}/${usageInfo.maxUsage} used)`);
    return {
      isValid: true,
      user: { email: user.email!, id: dbUser.id, name: user.name, image: user.image },
      usageInfo
    };
  }
}
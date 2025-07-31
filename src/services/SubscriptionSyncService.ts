import { prisma } from '@/lib/prisma';
import { subscriptionsApi } from '@/lib/square';

export interface SubscriptionSyncResult {
  totalUsers: number;
  syncedCount: number;
  updatedCount: number;
  errorCount: number;
  timestamp: string;
}

export interface UserSubscriptionUpdate {
  userId: number;
  email: string;
  oldStatus: string | null;
  newStatus: string;
  downgradedToFree: boolean;
}

export class SubscriptionSyncService {
  
  /**
   * Sync all user subscription statuses with Square
   */
  static async syncAllSubscriptions(): Promise<SubscriptionSyncResult> {
    console.log('🔄 Starting subscription status sync...');

    // Get all users with active subscriptions
    const usersWithSubscriptions = await prisma.user.findMany({
      where: {
        subscriptionId: { not: null },
        subscriptionStatus: { not: 'canceled' } // Only check non-canceled subscriptions
      },
      select: {
        id: true,
        email: true,
        subscriptionId: true,
        subscriptionStatus: true,
        plan: true,
        subscriptionTier: true
      }
    });

    console.log(`📊 Found ${usersWithSubscriptions.length} subscriptions to sync`);

    let syncedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const updates: UserSubscriptionUpdate[] = [];

    for (const user of usersWithSubscriptions) {
      try {
        if (!user.subscriptionId) continue;

        const updateResult = await this.syncUserSubscription(user);
        
        if (updateResult.success) {
          syncedCount++;
          if (updateResult.updated) {
            updatedCount++;
            updates.push(updateResult.update!);
          }
        } else {
          errorCount++;
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error syncing subscription for ${user.email}:`, error);
        errorCount++;
      }
    }

    const result: SubscriptionSyncResult = {
      totalUsers: usersWithSubscriptions.length,
      syncedCount,
      updatedCount,
      errorCount,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Subscription sync summary:', result);

    // Log all updates for audit purposes
    if (updates.length > 0) {
      console.log('📝 Subscription updates:', updates);
    }

    return result;
  }

  /**
   * Sync a single user's subscription status
   */
  private static async syncUserSubscription(user: {
    id: number;
    email: string;
    subscriptionId: string | null;
    subscriptionStatus: string | null;
    plan: string | null;
    subscriptionTier: string | null;
  }): Promise<{
    success: boolean;
    updated: boolean;
    update?: UserSubscriptionUpdate;
  }> {
    if (!user.subscriptionId) {
      return { success: false, updated: false };
    }

    console.log(`🔍 Checking subscription for ${user.email}: ${user.subscriptionId}`);

    // Retrieve subscription status from Square
    const squareResponse = await subscriptionsApi.get({
      subscriptionId: user.subscriptionId
    });

    if (squareResponse.errors && squareResponse.errors.length > 0) {
      console.error(`❌ Square API error for ${user.email}:`, squareResponse.errors);
      return { success: false, updated: false };
    }

    const squareSubscription = squareResponse.subscription;
    if (!squareSubscription) {
      console.warn(`⚠️ No subscription found in Square for ${user.email}`);
      return { success: false, updated: false };
    }

    const squareStatus = squareSubscription.status;
    const currentStatus = user.subscriptionStatus;

    if (!squareStatus) {
      console.warn(`⚠️ No status found in Square subscription for ${user.email}`);
      return { success: false, updated: false };
    }

    console.log(`📋 ${user.email}: Square status = ${squareStatus}, DB status = ${currentStatus}`);

    // Check if status has changed
    if (squareStatus === currentStatus) {
      return { success: true, updated: false };
    }

    console.log(`🔄 Updating ${user.email}: ${currentStatus} → ${squareStatus}`);

    // Determine what to update based on status
    const updateData: {
      subscriptionStatus: string;
      plan?: string;
      subscriptionTier?: string;
      subscriptionEndDate?: Date;
    } = {
      subscriptionStatus: squareStatus
    };

    let downgradedToFree = false;

    // If subscription is no longer active, downgrade to free
    if (this.isInactiveStatus(squareStatus)) {
      updateData.plan = 'free';
      updateData.subscriptionTier = 'free';
      updateData.subscriptionEndDate = new Date();
      downgradedToFree = true;
      
      console.log(`⬇️ Downgrading ${user.email} to free tier due to status: ${squareStatus}`);
    }

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    console.log(`✅ Updated ${user.email} subscription status`);

    const update: UserSubscriptionUpdate = {
      userId: user.id,
      email: user.email,
      oldStatus: currentStatus,
      newStatus: squareStatus,
      downgradedToFree
    };

    return { success: true, updated: true, update };
  }

  /**
   * Check if a subscription status indicates the subscription is no longer active
   */
  private static isInactiveStatus(status: string): boolean {
    const inactiveStatuses = ['CANCELED', 'PAUSED', 'DEACTIVATED', 'EXPIRED'];
    return inactiveStatuses.includes(status);
  }

  /**
   * Get all users who should be downgraded based on their subscription status
   */
  static async getUsersToDowngrade(): Promise<Array<{
    id: number;
    email: string;
    subscriptionStatus: string | null;
    plan: string | null;
  }>> {
    return await prisma.user.findMany({
      where: {
        subscriptionStatus: {
          in: ['CANCELED', 'PAUSED', 'DEACTIVATED', 'EXPIRED']
        },
        plan: { not: 'free' } // Only get users who haven't been downgraded yet
      },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        plan: true
      }
    });
  }

  /**
   * Manually trigger sync for a specific user
   */
  static async syncSingleUser(userId: number): Promise<{
    success: boolean;
    message: string;
    update?: UserSubscriptionUpdate;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          subscriptionId: true,
          subscriptionStatus: true,
          plan: true,
          subscriptionTier: true
        }
      });

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (!user.subscriptionId) {
        return { success: false, message: 'User has no subscription to sync' };
      }

      const result = await this.syncUserSubscription(user);
      
      if (result.success) {
        return {
          success: true,
          message: result.updated ? 'Subscription status updated' : 'Subscription status is up to date',
          update: result.update
        };
      } else {
        return { success: false, message: 'Failed to sync subscription status' };
      }

    } catch (error) {
      console.error('Error syncing single user subscription:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
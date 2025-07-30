import { prisma } from '@/lib/prisma';

export interface RecurringScanSettings {
  businessId: number;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextScanDate?: Date;
}

export class RecurringScansService {
  
  /**
   * Enable/disable recurring scans for a business
   */
  static async updateRecurringScans(
    businessId: number, 
    userId: number,
    settings: {
      enabled: boolean;
      frequency?: 'daily' | 'weekly' | 'monthly';
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify user has access to this business
      const business = await prisma.business.findFirst({
        where: {
          id: businessId,
          organizations: {
            some: {
              organization: {
                users: {
                  some: {
                    id: userId
                  }
                }
              }
            }
          }
        },
        include: {
          organizations: {
            include: {
              organization: {
                include: {
                  users: {
                    where: { id: userId },
                    select: { plan: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!business) {
        return { success: false, error: 'Business not found or access denied' };
      }

      // Check if user's tier supports recurring scans
      const userPlan = business.organizations[0]?.organization.users[0]?.plan || 'free';
      const hasRecurringScans = userPlan !== 'free'; // Available for indie+

      if (settings.enabled && !hasRecurringScans) {
        return { 
          success: false, 
          error: 'Recurring scans are not available for your subscription tier. Upgrade to Indie or higher.' 
        };
      }

      let nextScanDate: Date | null = null;
      
      if (settings.enabled && settings.frequency) {
        nextScanDate = this.calculateNextScanDate(settings.frequency);
      }

      // Update business settings
      await prisma.business.update({
        where: { id: businessId },
        data: {
          recurringScans: settings.enabled,
          scanFrequency: settings.enabled ? settings.frequency || 'weekly' : null,
          nextScanDate: nextScanDate,
          // Reset lastScanDate if enabling for first time
          lastScanDate: settings.enabled && !business.lastScanDate ? null : business.lastScanDate
        }
      });

      console.log(`✅ Updated recurring scans for business ${businessId}: ${settings.enabled ? 'enabled' : 'disabled'}`);

      return { success: true };

    } catch (error) {
      console.error('❌ Error updating recurring scans:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update recurring scans' 
      };
    }
  }

  /**
   * Get recurring scan settings for a business
   */
  static async getRecurringScans(businessId: number, userId: number) {
    try {
      const business = await prisma.business.findFirst({
        where: {
          id: businessId,
          organizations: {
            some: {
              organization: {
                users: {
                  some: {
                    id: userId
                  }
                }
              }
            }
          }
        },
        select: {
          id: true,
          websiteName: true,
          recurringScans: true,
          scanFrequency: true,
          lastScanDate: true,
          nextScanDate: true,
          organizations: {
            include: {
              organization: {
                include: {
                  users: {
                    where: { id: userId },
                    select: { plan: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!business) {
        return { success: false, error: 'Business not found or access denied' };
      }

      const userPlan = business.organizations[0]?.organization.users[0]?.plan || 'free';
      const hasRecurringScans = userPlan !== 'free';

      return {
        success: true,
        data: {
          businessId: business.id,
          businessName: business.websiteName,
          enabled: business.recurringScans,
          frequency: business.scanFrequency as 'daily' | 'weekly' | 'monthly' | null,
          lastScanDate: business.lastScanDate,
          nextScanDate: business.nextScanDate,
          hasAccess: hasRecurringScans,
          userPlan
        }
      };

    } catch (error) {
      console.error('❌ Error fetching recurring scans:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch recurring scans' 
      };
    }
  }

  /**
   * Get all businesses with recurring scans enabled for a user
   */
  static async getUserRecurringScans(userId: number) {
    try {
      const businesses = await prisma.business.findMany({
        where: {
          recurringScans: true,
          organizations: {
            some: {
              organization: {
                users: {
                  some: {
                    id: userId
                  }
                }
              }
            }
          }
        },
        select: {
          id: true,
          websiteName: true,
          scanFrequency: true,
          lastScanDate: true,
          nextScanDate: true,
          organizations: {
            include: {
              organization: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          nextScanDate: 'asc'
        }
      });

      return {
        success: true,
        data: businesses.map(business => ({
          businessId: business.id,
          businessName: business.websiteName,
          frequency: business.scanFrequency,
          lastScanDate: business.lastScanDate,
          nextScanDate: business.nextScanDate,
          organizationName: business.organizations[0]?.organization.name || 'Unknown'
        }))
      };

    } catch (error) {
      console.error('❌ Error fetching user recurring scans:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch recurring scans' 
      };
    }
  }

  /**
   * Calculate next scan date based on frequency
   */
  private static calculateNextScanDate(frequency: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to weekly
    }
  }

  /**
   * Trigger an immediate scan for a business (manual override)
   */
  static async triggerImmediateScan(businessId: number, userId: number) {
    try {
      // Verify user has access to this business
      const business = await prisma.business.findFirst({
        where: {
          id: businessId,
          organizations: {
            some: {
              organization: {
                users: {
                  some: {
                    id: userId
                  }
                }
              }
            }
          }
        }
      });

      if (!business) {
        return { success: false, error: 'Business not found or access denied' };
      }

      // Update nextScanDate to now so it gets picked up by the cron job
      await prisma.business.update({
        where: { id: businessId },
        data: {
          nextScanDate: new Date()
        }
      });

      return { 
        success: true, 
        message: 'Scan triggered. It will be processed within the next hour.' 
      };

    } catch (error) {
      console.error('❌ Error triggering immediate scan:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to trigger scan' 
      };
    }
  }
}
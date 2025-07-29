const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function migrateExistingData() {
  console.log('Starting data migration...');

  try {
    // 1. Create a default organization
    let defaultOrg = await prisma.organization.findFirst({
      where: { name: 'Default Organization' }
    });

    if (!defaultOrg) {
      defaultOrg = await prisma.organization.create({
        data: {
          name: 'Default Organization',
          domain: null
        }
      });
      console.log('Created default organization:', defaultOrg.id);
    }

    // 2. Update all users to belong to the default organization (if they don't have one)
    const usersWithoutOrg = await prisma.user.findMany({
      where: { organizationId: null }
    });

    for (const user of usersWithoutOrg) {
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: defaultOrg.id }
      });
    }
    console.log(`Updated ${usersWithoutOrg.length} users to default organization`);

    // 3. Get all unique business names from InputHistory
    const inputHistoryRecords = await prisma.inputHistory.findMany({
      where: { businessId: null },
      distinct: ['businessName'],
      select: {
        businessName: true,
        industry: true,
        location: true,
        websiteUrl: true,
        businessDescription: true,
        userId: true
      }
    });

    // 4. Create Business records for each unique business
    const businessMap = new Map();

    for (const record of inputHistoryRecords) {
      if (!record.businessName || businessMap.has(record.businessName)) {
        continue;
      }

      const business = await prisma.business.create({
        data: {
          websiteName: record.businessName,
          websiteUrl: record.websiteUrl,
          organizationId: defaultOrg.id,
          userId: record.userId,
          industry: record.industry,
          location: record.location,
          description: record.businessDescription
        }
      });

      businessMap.set(record.businessName, business.id);
      console.log(`Created business: ${record.businessName} (ID: ${business.id})`);
    }

    // 5. Update InputHistory records
    for (const [businessName, businessId] of businessMap.entries()) {
      await prisma.inputHistory.updateMany({
        where: { 
          businessName: businessName,
          businessId: null 
        },
        data: { businessId: businessId }
      });
    }
    console.log('Updated InputHistory records');

    // 6. Update RankingHistory records
    for (const [businessName, businessId] of businessMap.entries()) {
      await prisma.rankingHistory.updateMany({
        where: { 
          businessName: businessName,
          businessId: null 
        },
        data: { businessId: businessId }
      });
    }
    console.log('Updated RankingHistory records');

    // 7. Update AeoScore records
    for (const [businessName, businessId] of businessMap.entries()) {
      await prisma.aeoScore.updateMany({
        where: { 
          businessName: businessName,
          businessId: null 
        },
        data: { businessId: businessId }
      });
    }
    console.log('Updated AeoScore records');

    console.log('Migration completed successfully!');
    console.log(`Created ${businessMap.size} business records`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingData();
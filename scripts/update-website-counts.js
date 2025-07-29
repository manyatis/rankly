const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function updateWebsiteCounts() {
  try {
    console.log('Updating organization website counts...');
    
    // Get all organizations
    const organizations = await prisma.organization.findMany({
      include: {
        businesses: true
      }
    });

    for (const org of organizations) {
      const businessCount = org.businesses.length;
      
      if (org.websiteCount !== businessCount) {
        await prisma.organization.update({
          where: { id: org.id },
          data: { websiteCount: businessCount }
        });
        
        console.log(`Updated organization "${org.name}" (ID: ${org.id}): ${org.websiteCount} -> ${businessCount} websites`);
      } else {
        console.log(`Organization "${org.name}" (ID: ${org.id}): ${businessCount} websites (already correct)`);
      }
    }
    
    console.log('Website count update completed.');
  } catch (error) {
    console.error('Error updating website counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateWebsiteCounts();
#!/usr/bin/env node

const { PrismaClient } = require('../src/generated/prisma');

async function resetDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log('🗑️  Starting database reset...');
    
    // Delete in order to respect foreign key constraints
    console.log('Clearing QueryResult records...');
    await prisma.queryResult.deleteMany();
    
    console.log('Clearing AIInsight records...');
    await prisma.aIInsight.deleteMany();
    
    console.log('Clearing RankingHistory records...');
    await prisma.rankingHistory.deleteMany();
    
    console.log('Clearing InputHistory records...');
    await prisma.inputHistory.deleteMany();
    
    console.log('Clearing AeoScore records...');
    await prisma.aeoScore.deleteMany();
    
    console.log('Clearing Competitor relationships...');
    await prisma.competitor.deleteMany();
    
    console.log('Clearing OrganizationBusiness relationships...');
    await prisma.organizationBusiness.deleteMany();
    
    console.log('Clearing Business records...');
    await prisma.business.deleteMany();
    
    console.log('Clearing Organizations (except "My Org")...');
    await prisma.organization.deleteMany({
      where: {
        name: {
          not: 'My Org'
        }
      }
    });
    
    console.log('Clearing user sessions and accounts...');
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    
    // Get final counts
    const summary = {
      businesses: await prisma.business.count(),
      aeoScores: await prisma.aeoScore.count(),
      rankings: await prisma.rankingHistory.count(),
      competitors: await prisma.competitor.count(),
      users: await prisma.user.count(),
      organizations: await prisma.organization.count(),
      queryResults: await prisma.queryResult.count(),
      aiInsights: await prisma.aIInsight.count()
    };
    
    console.log('\n✅ Database reset complete!');
    console.log('📊 Summary:');
    console.log(`   - Businesses remaining: ${summary.businesses}`);
    console.log(`   - AEO Scores remaining: ${summary.aeoScores}`);
    console.log(`   - Rankings remaining: ${summary.rankings}`);
    console.log(`   - Competitors remaining: ${summary.competitors}`);
    console.log(`   - Query Results remaining: ${summary.queryResults}`);
    console.log(`   - AI Insights remaining: ${summary.aiInsights}`);
    console.log(`   - Users remaining: ${summary.users}`);
    console.log(`   - Organizations remaining: ${summary.organizations}`);
    
    console.log('\n🚀 Ready for fresh testing!');
    console.log('You can now:');
    console.log('   1. Login to the dashboard');
    console.log('   2. Use the Link Website tab to add a new website');
    console.log('   3. Watch the progress bar during analysis');
    console.log('   4. View results in Trends and Competitors tabs');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
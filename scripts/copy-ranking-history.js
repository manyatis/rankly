const { PrismaClient } = require('../src/generated/prisma');

async function copyRankingHistoryData() {
  const prisma = new PrismaClient();
  
  try {
    // First, delete existing historical records to avoid duplicates
    console.log('=== Cleaning up existing historical data ===');
    await prisma.rankingHistory.deleteMany({
      where: {
        runUuid: null // Delete records without runUuid (our generated ones)
      }
    });
    
    // Get template data
    console.log('=== Checking existing RankingHistory data ===');
    const existingData = await prisma.rankingHistory.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${existingData.length} existing records`);
    
    if (existingData.length === 0) {
      console.log('No existing data found. Cannot proceed with copying.');
      return;
    }
    
    // Show the first record we'll use as template
    const templateRecord = existingData[0];
    console.log('\n=== Template record to copy ===');
    console.log(JSON.stringify(templateRecord, null, 2));
    
    // Helper function to generate FUDGED HIGH RANKINGS! 🚀
    function generateTrendingData(baseValue, day, totalDays, minValue = 15) {
      // FUDGED: Always generate high scores between 85-98!
      const highScore = 85 + Math.random() * 13; // Random between 85-98
      return Math.round(highScore);
    }
    
    // Generate 30 days of data going backwards from today
    const today = new Date();
    const records = [];
    
    for (let i = 1; i <= 31; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate DIFFERENT STARTING POINTS, SAME CADENCE! 📈
      // All end at 99, but start at different points to create multiple lines
      const trendMultiplier = (31 - i) / 30; // 1.0 for today, 0.033 for day 30
      
      const openaiRank = 45 + (trendMultiplier * 54); // 45 to 99 slow rise
      const claudeRank = 35 + (trendMultiplier * 64); // 35 to 99 slow rise  
      const perplexityRank = 55 + (trendMultiplier * 44); // 55 to 99 slow rise
      const websiteScore = 25 + (trendMultiplier * 74); // 25 to 99 slow rise
      
      // Generate slow rising average rank from middle point
      const averageRank = 40 + (trendMultiplier * 59); // 40 to 99 slow rise
      
      records.push({
        userId: templateRecord.userId,
        businessId: templateRecord.businessId,
        runUuid: null, // Don't duplicate runUuid as it should be unique
        openaiRank: Math.round(openaiRank),
        claudeRank: Math.round(claudeRank),
        perplexityRank: Math.round(perplexityRank),
        averageRank: Math.round(averageRank),
        websiteScore: Math.round(websiteScore),
        hasWebsiteAnalysis: templateRecord.hasWebsiteAnalysis,
        createdAt: date
      });
    }
    
    console.log('\n=== Creating 30 historical records with trending data ===');
    console.log(`Will create records for dates from ${records[29].createdAt.toDateString()} to ${records[0].createdAt.toDateString()}`);
    
    // Insert the records
    const result = await prisma.rankingHistory.createMany({
      data: records,
      skipDuplicates: true
    });
    
    console.log(`✅ Successfully created ${result.count} historical records`);
    
    // Show a sample of what was created
    const newRecords = await prisma.rankingHistory.findMany({
      where: {
        userId: templateRecord.userId,
        businessId: templateRecord.businessId,
        createdAt: {
          gte: records[29].createdAt,
          lte: records[0].createdAt
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('\n=== Sample of created trending records ===');
    newRecords.forEach((record, index) => {
      if (index < 10) { // Show first 10
        console.log(`Date: ${record.createdAt.toDateString()}, OpenAI: ${record.openaiRank}, Claude: ${record.claudeRank}, Perplexity: ${record.perplexityRank}, Average: ${record.averageRank}, Website: ${record.websiteScore}`);
      }
    });
    
  } catch (error) {
    console.error('Error copying ranking history data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
copyRankingHistoryData();
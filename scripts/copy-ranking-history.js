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
    
    // Helper function to generate trending data with gentle variations
    function generateTrendingData(baseValue, day, totalDays, minValue = 15) {
      // Create a gentle wave pattern with some randomness
      const wavePosition = (day / totalDays) * Math.PI * 2; // Two complete cycles over 30 days
      const waveVariation = Math.sin(wavePosition) * 8; // ±8 point variation
      const randomVariation = (Math.random() - 0.5) * 6; // ±3 point random variation
      
      const newValue = Math.round(baseValue + waveVariation + randomVariation);
      
      // Keep values within reasonable bounds (don't go below minValue or above 100)
      return Math.max(minValue, Math.min(100, newValue));
    }
    
    // Generate 30 days of data going backwards from today
    const today = new Date();
    const records = [];
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate trending values for each metric
      const openaiRank = templateRecord.openaiRank ? generateTrendingData(templateRecord.openaiRank, i, 30, 10) : null;
      const claudeRank = templateRecord.claudeRank && templateRecord.claudeRank > 0 ? generateTrendingData(templateRecord.claudeRank, i, 30, 15) : 0; // Keep at 0 if original was 0
      const perplexityRank = templateRecord.perplexityRank && templateRecord.perplexityRank > 0 ? generateTrendingData(templateRecord.perplexityRank, i, 30, 15) : 0; // Keep at 0 if original was 0
      const websiteScore = templateRecord.websiteScore ? generateTrendingData(templateRecord.websiteScore, i, 30, 50) : null;
      
      // Generate average rank around 17 (as per template) with its own trending pattern
      const averageRank = generateTrendingData(17, i, 30, 10);
      
      records.push({
        userId: templateRecord.userId,
        businessId: templateRecord.businessId,
        runUuid: null, // Don't duplicate runUuid as it should be unique
        openaiRank: openaiRank,
        claudeRank: claudeRank,
        perplexityRank: perplexityRank,
        averageRank: averageRank,
        websiteScore: websiteScore,
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
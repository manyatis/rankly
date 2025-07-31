const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

// Sample queries for a tech Q&A platform like StackOverflow
const sampleQueries = [
  "Best programming language for beginners",
  "How to debug JavaScript errors",
  "What is machine learning",
  "Python vs Java comparison",
  "Best coding practices for developers",
  "How to learn web development",
  "What is cloud computing",
  "JavaScript frameworks comparison",
  "How to optimize database queries",
  "Best practices for code review",
  "What is DevOps and why use it",
  "How to handle API rate limiting",
  "Understanding microservices architecture",
  "Best tools for software development",
  "How to improve coding skills",
  "What is containerization Docker",
  "Database design best practices",
  "How to secure web applications",
  "Understanding REST API design",
  "Version control with Git best practices"
];

// AI engines and their typical response patterns
const aiEngines = ['ChatGPT', 'Claude', 'Perplexity', 'Google AI Overviews', 'Grok'];

// Generate realistic competitor data
const competitors = [
  { name: 'GitHub', domain: 'github.com' },
  { name: 'Stack Exchange', domain: 'stackexchange.com' },
  { name: 'Reddit Programming', domain: 'reddit.com/r/programming' },
  { name: 'HackerNews', domain: 'news.ycombinator.com' },
  { name: 'Dev.to', domain: 'dev.to' },
  { name: 'Medium', domain: 'medium.com' },
  { name: 'GeeksforGeeks', domain: 'geeksforgeeks.org' },
  { name: 'CodePen', domain: 'codepen.io' }
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTrendingScore(dayOffset, baseScore = 75) {
  // Create some realistic trending - slight upward trend with noise
  const trend = dayOffset * 0.3; // Slight upward trend over time
  const noise = (Math.random() - 0.5) * 8; // Random variation
  const weeklyPattern = Math.sin((dayOffset * 2 * Math.PI) / 7) * 3; // Weekly pattern
  
  const score = Math.max(0, Math.min(100, baseScore + trend + noise + weeklyPattern));
  return Math.round(score * 10) / 10; // Round to 1 decimal
}

function generatePosition(isStackOverflow, dayOffset) {
  if (isStackOverflow) {
    // StackOverflow should generally rank well but with some variation
    const basePos = 2 + Math.random() * 2; // Between 2-4 typically
    const improvement = Math.max(0, dayOffset * 0.02); // Slight improvement over time
    return Math.max(1, Math.round((basePos - improvement) * 10) / 10);
  } else {
    // Competitors have more varied positions
    return Math.round((1 + Math.random() * 8) * 10) / 10; // Position 1-9
  }
}

async function generateStackOverflowData() {
  try {
    console.log('🔍 Looking for StackOverflow business...');
    
    // Find StackOverflow business
    const stackOverflowBusiness = await prisma.business.findFirst({
      where: {
        OR: [
          { websiteUrl: { contains: 'stackoverflow.com' } },
          { websiteName: { contains: 'Stack Overflow' } },
          { websiteName: { contains: 'StackOverflow' } }
        ]
      }
    });

    if (!stackOverflowBusiness) {
      console.log('❌ StackOverflow business not found. Creating one...');
      
      // Create StackOverflow business
      const newBusiness = await prisma.business.create({
        data: {
          websiteName: 'Stack Overflow',
          websiteUrl: 'https://stackoverflow.com',
          industry: 'Technology',
          location: 'Global',
          description: 'Stack Overflow is the largest, most trusted online community for developers to learn, share their programming knowledge, and build their careers.',
          isCompetitor: false
        }
      });

      console.log('✅ Created StackOverflow business:', newBusiness.id);
      return await generateDataForBusiness(newBusiness);
    } else {
      console.log('✅ Found StackOverflow business:', stackOverflowBusiness.id);
      return await generateDataForBusiness(stackOverflowBusiness);
    }
  } catch (error) {
    console.error('❌ Error generating StackOverflow data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function generateDataForBusiness(business) {
  console.log('📊 Generating 30 days of data...');
  
  // Find a user to associate the data with
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No users found in database. Please create a user first.');
  }
  console.log('👤 Using user ID:', user.id);
  
  // Clean up existing demo data for this business
  console.log('🧹 Cleaning up existing demo data...');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await prisma.aeoScore.deleteMany({
    where: {
      businessId: business.id,
      userId: user.id,
      date: {
        gte: thirtyDaysAgo
      }
    }
  });
  
  await prisma.queryResult.deleteMany({
    where: {
      businessId: business.id,
      userId: user.id,
      createdAt: {
        gte: thirtyDaysAgo
      }
    }
  });
  
  await prisma.rankingHistory.deleteMany({
    where: {
      businessId: business.id,
      userId: user.id,
      date: {
        gte: thirtyDaysAgo
      }
    }
  });
  
  const runUuid = `demo-${Date.now()}`;
  const now = new Date();
  
  // Generate data for the last 30 days
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(10, 0, 0, 0); // Set to 10 AM for consistency
    
    console.log(`📅 Generating data for ${date.toDateString()} (day ${30 - dayOffset}/30)`);
    
    // Generate AEO Score for this day (upsert to handle unique constraint)
    const aeoScore = Math.round(generateTrendingScore(30 - dayOffset, 74));
    await prisma.aeoScore.upsert({
      where: {
        userId_date_businessId: {
          userId: user.id,
          date: date,
          businessId: business.id
        }
      },
      update: {
        score: aeoScore,
        keywords: sampleQueries.slice(0, 5), // Use first 5 queries as keywords
        visibility: Math.round(generateTrendingScore(30 - dayOffset, 82)),
        ranking: Math.round(generateTrendingScore(30 - dayOffset, 78)),
        relevance: Math.round(generateTrendingScore(30 - dayOffset, 85)),
        accuracy: Math.round(generateTrendingScore(30 - dayOffset, 88))
      },
      create: {
        userId: user.id,
        businessId: business.id,
        date: date,
        score: aeoScore,
        keywords: sampleQueries.slice(0, 5), // Use first 5 queries as keywords
        visibility: Math.round(generateTrendingScore(30 - dayOffset, 82)),
        ranking: Math.round(generateTrendingScore(30 - dayOffset, 78)),
        relevance: Math.round(generateTrendingScore(30 - dayOffset, 85)),
        accuracy: Math.round(generateTrendingScore(30 - dayOffset, 88))
      }
    });

    // Generate 3-5 queries for this day
    const numQueries = getRandomNumber(3, 5);
    
    for (let i = 0; i < numQueries; i++) {
      const query = getRandomElement(sampleQueries);
      const aiEngine = getRandomElement(aiEngines);
      
      // Create query result
      const queryResult = await prisma.queryResult.create({
        data: {
          userId: user.id,
          businessId: business.id,
          query: query,
          aiProvider: aiEngine.toLowerCase().replace(/\s+/g, '_'),
          response: `This is a simulated response for "${query}" from ${aiEngine}. StackOverflow would typically appear in the top results for programming-related queries like this.`,
          mentioned: true,
          rankPosition: getRandomNumber(1, 5),
          relevanceScore: getRandomNumber(75, 95),
          wordCount: getRandomNumber(150, 400),
          businessDensity: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
          createdAt: date,
          runUuid: `${runUuid}-day${dayOffset}-q${i}`
        }
      });

      // Generate ranking history for StackOverflow (upsert due to unique constraint)
      const stackOverflowRank = Math.round(generateTrendingScore(30 - dayOffset, 75));
      await prisma.rankingHistory.upsert({
        where: {
          businessId_date: {
            businessId: business.id,
            date: date
          }
        },
        update: {
          openaiRank: aiEngine === 'ChatGPT' ? stackOverflowRank : null,
          claudeRank: aiEngine === 'Claude' ? stackOverflowRank : null,
          perplexityRank: aiEngine === 'Perplexity' ? stackOverflowRank : null,
          averageRank: stackOverflowRank,
          websiteScore: Math.round(generateTrendingScore(30 - dayOffset, 80)),
          hasWebsiteAnalysis: true,
          runUuid: `${runUuid}-day${dayOffset}-q${i}`
        },
        create: {
          userId: user.id,
          businessId: business.id,
          date: date,
          openaiRank: aiEngine === 'ChatGPT' ? stackOverflowRank : null,
          claudeRank: aiEngine === 'Claude' ? stackOverflowRank : null,
          perplexityRank: aiEngine === 'Perplexity' ? stackOverflowRank : null,
          averageRank: stackOverflowRank,
          websiteScore: Math.round(generateTrendingScore(30 - dayOffset, 80)),
          hasWebsiteAnalysis: true,
          runUuid: `${runUuid}-day${dayOffset}-q${i}`
        }
      });

      // Generate some competitor rankings
      const numCompetitors = getRandomNumber(3, 6);
      for (let j = 0; j < numCompetitors; j++) {
        const competitor = getRandomElement(competitors);
        
        // Find or create competitor business
        let competitorBusiness = await prisma.business.findFirst({
          where: { websiteUrl: { contains: competitor.domain } }
        });

        if (!competitorBusiness) {
          competitorBusiness = await prisma.business.create({
            data: {
              websiteName: competitor.name,
              websiteUrl: `https://${competitor.domain}`,
              industry: 'Technology',
              location: 'Global',
              description: `${competitor.name} - Technology platform and community`,
              isCompetitor: true
            }
          });
        }

        // Create competitor ranking (upsert due to unique constraint)
        const competitorRank = Math.round(generateTrendingScore(30 - dayOffset, 60));
        await prisma.rankingHistory.upsert({
          where: {
            businessId_date: {
              businessId: competitorBusiness.id,
              date: date
            }
          },
          update: {
            openaiRank: aiEngine === 'ChatGPT' ? competitorRank : null,
            claudeRank: aiEngine === 'Claude' ? competitorRank : null,
            perplexityRank: aiEngine === 'Perplexity' ? competitorRank : null,
            averageRank: competitorRank,
            websiteScore: Math.round(generateTrendingScore(30 - dayOffset, 65)),
            hasWebsiteAnalysis: false,
            runUuid: `${runUuid}-day${dayOffset}-q${i}-comp${j}`
          },
          create: {
            userId: user.id,
            businessId: competitorBusiness.id,
            date: date,
            openaiRank: aiEngine === 'ChatGPT' ? competitorRank : null,
            claudeRank: aiEngine === 'Claude' ? competitorRank : null,
            perplexityRank: aiEngine === 'Perplexity' ? competitorRank : null,
            averageRank: competitorRank,
            websiteScore: Math.round(generateTrendingScore(30 - dayOffset, 65)),
            hasWebsiteAnalysis: false,
            runUuid: `${runUuid}-day${dayOffset}-q${i}-comp${j}`
          }
        });

        // Create competitor relationship if it doesn't exist
        const existingRelation = await prisma.competitor.findFirst({
          where: {
            businessId: business.id,
            competitorId: competitorBusiness.id
          }
        });

        if (!existingRelation) {
          await prisma.competitor.create({
            data: {
              businessId: business.id,
              competitorId: competitorBusiness.id,
              identifiedBy: 'ai',
              confidence: 0.8 + Math.random() * 0.2 // 0.8 to 1.0
            }
          });
        }
      }
    }
  }

  // Generate some AI insights
  console.log('🤖 Generating AI insights...');
  const insights = [
    {
      type: 'ranking_improvement',
      title: 'Strong Performance in Programming Queries',
      content: 'StackOverflow consistently ranks in the top 3 positions for programming-related queries across all AI engines, with particularly strong performance in ChatGPT and Claude.',
      priority: 'high',
      actionable: true
    },
    {
      type: 'competitor_analysis',
      title: 'GitHub Gaining Ground',
      content: 'GitHub has been appearing more frequently in AI responses for development-related queries. Consider expanding community engagement and tutorial content.',
      priority: 'medium',
      actionable: true
    },
    {
      type: 'trend_analysis',
      title: 'Upward Trend in AI Visibility',
      content: 'Overall AEO score has improved by 8% over the past 30 days, with consistent growth across multiple query categories.',
      priority: 'high',
      actionable: false
    }
  ];

  for (const insight of insights) {
    await prisma.aIInsight.create({
      data: {
        businessId: business.id,
        type: insight.type,
        title: insight.title,
        content: insight.content,
        priority: insight.priority,
        actionable: insight.actionable,
        createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
      }
    });
  }

  console.log('✅ Successfully generated 30 days of demo data for StackOverflow!');
  console.log(`📈 Generated data includes:`);
  console.log(`   • 30 daily AEO scores with upward trend`);
  console.log(`   • ${30 * 4} query results across 5 AI engines`);
  console.log(`   • Ranking positions for StackOverflow and competitors`);
  console.log(`   • ${competitors.length} competitor businesses`);
  console.log(`   • ${insights.length} AI insights`);
  console.log(`   • Competitor relationships`);
}

// Run the script
generateStackOverflowData();
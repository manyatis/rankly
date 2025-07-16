import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface AIProvider {
  name: string;
  model: string;
  color: string;
}

interface ScoringFactors {
  accuracy: number;
  relevance: number;
  completeness: number;
  brandMention: number;
  citations: number;
  visibility: number;
  ranking: number;
}

interface ScoringResult {
  provider: AIProvider;
  response: string;
  aeoScore: number;
  factors: ScoringFactors;
  analysis: string;
  queryVariations: QueryResult[];
  overallVisibility: number;
  competitorAnalysis: CompetitorInfo[];
  missedResponses: QueryResult[];
}

interface CompetitorInfo {
  name: string;
  mentions: number;
  score: number;
}

interface QueryResult {
  query: string;
  response: string;
  mentioned: boolean;
  rankPosition: number;
  relevanceScore: number;
}

// Configuration - easily adjustable
const MAX_QUERIES = parseInt(process.env.MAX_AEO_QUERIES || '10'); // Default 10, configurable via env var

function generateKeywordBasedQueries(businessName: string, keywords: string[], maxQueries: number = MAX_QUERIES): string[] {
  console.log(`🎯 Generating ${maxQueries} queries for business: "${businessName}" with keywords:`, keywords);

  const variations: string[] = [];

  // Generate different combinations of keywords
  const keywordCombinations = generateKeywordCombinations(keywords);
  console.log(`🔄 Generated ${keywordCombinations.length} keyword combinations:`, keywordCombinations);

  // Priority 1: Single keyword queries (most effective)
  keywords.forEach(keyword => {
    variations.push(
      `List the top companies and people that provide ${keyword}`,
      `What are the best ${keyword} companies and experts?`,
      `Who are the leading ${keyword} providers and specialists?`,
      `Top ${keyword} companies, specialists and experts`
    );
  });

  // Priority 2: Multi-keyword combinations
  keywordCombinations.slice(0, 3).forEach(combo => {
    const keywordPhrase = combo.join(' ');
    variations.push(
      `Best ${keywordPhrase} companies and experts in the market`,
      `Leading ${keywordPhrase} service providers and specialists`,
      `Top ${keywordPhrase} firms, consultants and experts`
    );
  });

  // Priority 3: Comparative queries (if we have space)
  if (keywords.length >= 2 && variations.length < maxQueries * 2) {
    variations.push(
      `Companies and experts that specialize in ${keywords[0]} and ${keywords[1]}`,
      `${keywords[0]} plus ${keywords[1]} service providers and specialists`
    );
  }

  // Shuffle and take the requested number
  const shuffled = variations.sort(() => Math.random() - 0.5);
  const finalQueries = shuffled.slice(0, maxQueries);

  console.log(`📝 Selected ${finalQueries.length} queries from ${variations.length} possibilities:`);
  finalQueries.forEach((query, index) => {
    console.log(`   ${index + 1}. "${query}"`);
  });

  return finalQueries;
}

function generateKeywordCombinations(keywords: string[]): string[][] {
  const combinations: string[][] = [];

  // Single keywords
  keywords.forEach(keyword => {
    combinations.push([keyword]);
  });

  // Pairs of keywords
  for (let i = 0; i < keywords.length; i++) {
    for (let j = i + 1; j < keywords.length; j++) {
      combinations.push([keywords[i], keywords[j]]);
    }
  }

  // Triple combinations if we have enough keywords
  if (keywords.length >= 3) {
    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        for (let k = j + 1; k < keywords.length; k++) {
          combinations.push([keywords[i], keywords[j], keywords[k]]);
        }
      }
    }
  }

  // All keywords together if reasonable length
  if (keywords.length <= 5) {
    combinations.push(keywords);
  }

  return combinations;
}

function generateBusinessNameVariations(businessName: string): string[] {
  const variations: string[] = [businessName];

  // Basic variations with different spacing
  variations.push(businessName.replace(/\s+/g, ''));
  variations.push(businessName.replace(/\s+/g, '-'));
  variations.push(businessName.replace(/\s+/g, '_'));

  // Add variations with different casing
  variations.push(businessName.toLowerCase());
  variations.push(businessName.toUpperCase());
  variations.push(businessName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '));

  // Remove common business suffixes
  const withoutSuffixes = businessName.replace(/\b(inc|llc|corp|corporation|company|co|ltd|limited|enterprises|group|solutions|services|consulting|partners|associates|international|global|usa|america)\b/gi, '').trim();
  if (withoutSuffixes !== businessName) {
    variations.push(withoutSuffixes);
    variations.push(withoutSuffixes.replace(/\s+/g, ''));
  }

  // Add variations with common abbreviations
  variations.push(businessName.replace(/\band\b/gi, '&'));
  variations.push(businessName.replace(/\b&\b/gi, 'and'));

  // Generate word permutations for multi-word names
  const words = businessName.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length > 1) {
    // All possible spacing combinations
    generateSpacingPermutations(words).forEach(variation => {
      variations.push(variation);
    });

    // Word order permutations (up to 3 words to avoid explosion)
    if (words.length <= 3) {
      generateWordOrderPermutations(words).forEach(permutation => {
        variations.push(permutation.join(' '));
        variations.push(permutation.join(''));
        variations.push(permutation.join('-'));
      });
    }
  }

  return [...new Set(variations)].filter(v => v.length > 1);
}

function generateSpacingPermutations(words: string[]): string[] {
  const variations: string[] = [];

  // Generate all possible spacing combinations
  // For "v tee golf" -> "vteegolf", "v teegolf", "vtee golf", etc.
  for (let i = 0; i < Math.pow(2, words.length - 1); i++) {
    let result = words[0];
    for (let j = 1; j < words.length; j++) {
      if (i & Math.pow(2, j - 1)) {
        result += ' ' + words[j];
      } else {
        result += words[j];
      }
    }
    variations.push(result);
  }

  return variations;
}

function generateWordOrderPermutations(words: string[]): string[][] {
  if (words.length <= 1) return [words];

  const permutations: string[][] = [];

  for (let i = 0; i < words.length; i++) {
    const rest = words.slice(0, i).concat(words.slice(i + 1));
    const restPermutations = generateWordOrderPermutations(rest);

    for (const perm of restPermutations) {
      permutations.push([words[i], ...perm]);
    }
  }

  return permutations;
}

function findFuzzyMatches(businessName: string, responseText: string): Array<{ match: string, index: number, score: number }> {
  const matches: Array<{ match: string, index: number, score: number }> = [];

  // Remove all non-alphanumeric characters and convert to lowercase
  const cleanBusinessName = businessName.replace(/[^a-z0-9]/g, '');

  if (cleanBusinessName.length < 3) return matches; // Too short for fuzzy matching

  // Split business name into words for flexible matching
  const businessWords = businessName.split(/\s+/).filter(w => w.length > 1);

  // Strategy 1: Look for the business name with flexible spacing
  const regexPattern = businessWords.map(word =>
    word.split('').map(char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*')
  ).join('\\s+');

  try {
    const regex = new RegExp(regexPattern, 'gi');
    let match;
    while ((match = regex.exec(responseText)) !== null) {
      matches.push({
        match: match[0],
        index: match.index,
        score: calculateMatchScore(businessName, match[0])
      });
    }
  } catch {
    // Regex error, skip this strategy
  }

  // Strategy 2: Look for concatenated version with word boundaries
  if (businessWords.length > 1) {
    const concatenated = businessWords.join('');
    const concatRegex = new RegExp(`\\b${concatenated.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');

    try {
      let match;
      while ((match = concatRegex.exec(responseText)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          score: calculateMatchScore(businessName, match[0])
        });
      }
    } catch {
      // Regex error, skip this strategy
    }
  }

  // Strategy 3: Look for individual words close together
  if (businessWords.length > 1) {
    for (let i = 0; i < businessWords.length - 1; i++) {
      const word1 = businessWords[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const word2 = businessWords[i + 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const proximityRegex = new RegExp(`\\b${word1}\\s{0,3}${word2}\\b`, 'gi');

      try {
        let match;
        while ((match = proximityRegex.exec(responseText)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            score: calculateMatchScore(businessName, match[0]) * 0.8 // Lower score for partial matches
          });
        }
      } catch {
        // Regex error, skip this strategy
      }
    }
  }

  // Sort by score (highest first) and return top matches
  return matches
    .filter(m => m.score > 0.3) // Only return matches with decent confidence
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Return top 5 matches
}

function calculateMatchScore(original: string, match: string): number {
  const originalClean = original.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matchClean = match.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Calculate similarity based on character overlap
  let score = 0;
  const maxLength = Math.max(originalClean.length, matchClean.length);

  // Count matching characters
  let matchingChars = 0;
  const originalChars = originalClean.split('');
  const matchChars = matchClean.split('');

  for (const char of originalChars) {
    const index = matchChars.indexOf(char);
    if (index !== -1) {
      matchingChars++;
      matchChars.splice(index, 1); // Remove to avoid double counting
    }
  }

  score = matchingChars / maxLength;

  // Bonus for exact length match
  if (originalClean.length === matchClean.length) {
    score += 0.1;
  }

  // Bonus for word boundary matches
  if (match.match(/^\w/) && match.match(/\w$/)) {
    score += 0.1;
  }

  return Math.min(1.0, score);
}

async function queryAIWithVariations(
  queryFunction: (query: string) => Promise<string>,
  businessName: string,
  keywords: string[],
  maxQueries: number = MAX_QUERIES
): Promise<QueryResult[]> {
  console.log(`🚀 Starting AI analysis for "${businessName}" with keywords:`, keywords);

  const keywordQueries = generateKeywordBasedQueries(businessName, keywords, maxQueries);
  const businessNameVariations = generateBusinessNameVariations(businessName);
  console.log(`🔍 Business name variations to search for:`, businessNameVariations);

  const results: QueryResult[] = [];

  for (let i = 0; i < keywordQueries.length; i++) {
    const query = keywordQueries[i];
    console.log(`\n📤 Query ${i + 1}/${keywordQueries.length}: "${query}"`);

    try {
      const response = await queryFunction(query);
      console.log(`📥 Response length: ${response.length} characters`);
      console.log(`📄 Response preview: "${response.substring(0, 200)}..."`);

      const responseLower = response.toLowerCase();

      // Check if any variation of the business name appears in the response
      let mentioned = false;
      let bestMatch = '';
      let bestIndex = -1;

      console.log(`🔎 Searching for business name variations in response...`);

      // First try exact matches
      for (const nameVariation of businessNameVariations) {
        const nameIndex = responseLower.indexOf(nameVariation.toLowerCase());
        if (nameIndex !== -1) {
          console.log(`✅ EXACT MATCH "${nameVariation}" at position ${nameIndex}`);
          mentioned = true;
          if (bestIndex === -1 || nameIndex < bestIndex) {
            bestIndex = nameIndex;
            bestMatch = nameVariation;
          }
        }
      }

      // If no exact match, try fuzzy matching with regex
      if (!mentioned) {
        console.log(`🔍 No exact matches found, trying fuzzy matching...`);
        for (const nameVariation of businessNameVariations) {
          const fuzzyMatches = findFuzzyMatches(nameVariation.toLowerCase(), responseLower);
          if (fuzzyMatches.length > 0) {
            const match = fuzzyMatches[0];
            console.log(`🎯 FUZZY MATCH "${match.match}" (score: ${match.score}) at position ${match.index}`);
            mentioned = true;
            if (bestIndex === -1 || match.index < bestIndex) {
              bestIndex = match.index;
              bestMatch = match.match;
            }
            break; // Use first fuzzy match found
          }
        }
      }

      if (!mentioned) {
        console.log(`❌ Business name NOT found in this response`);
      } else {
        console.log(`🎯 Best match: "${bestMatch}" at position ${bestIndex}`);
      }

      let rankPosition = 0;
      let relevanceScore = 0;

      if (mentioned) {
        // Calculate rank position based on where business appears in response
        if (bestIndex < 50) rankPosition = 1;
        else if (bestIndex < 150) rankPosition = 2;
        else if (bestIndex < 300) rankPosition = 3;
        else if (bestIndex < 500) rankPosition = 4;
        else rankPosition = 5;

        console.log(`📍 Rank position: ${rankPosition} (found at character ${bestIndex})`);

        // Calculate relevance score based on multiple factors
        let score = 0;

        // Base score for being mentioned
        score += 20;
        console.log(`📊 Base score: +20 = ${score}`);

        // Bonus for early mention
        if (bestIndex < 50) {
          score += 30;
          console.log(`📊 Early mention bonus: +30 = ${score}`);
        } else if (bestIndex < 150) {
          score += 20;
          console.log(`📊 Early mention bonus: +20 = ${score}`);
        } else if (bestIndex < 300) {
          score += 10;
          console.log(`📊 Early mention bonus: +10 = ${score}`);
        }

        // Bonus for being in first sentence
        const firstSentence = response.split(/[.!?]/)[0];
        if (firstSentence.toLowerCase().includes(bestMatch.toLowerCase())) {
          score += 25;
          console.log(`📊 First sentence bonus: +25 = ${score}`);
        }

        // Bonus for context quality (mentioned with positive terms)
        const contextWords = ['leading', 'top', 'best', 'premier', 'innovative', 'excellent', 'outstanding', 'renowned', 'established', 'trusted', 'professional', 'expert', 'specialist'];
        const negativeWords = ['small', 'unknown', 'new', 'startup', 'limited', 'basic'];

        let contextBonus = 0;
        for (const word of contextWords) {
          if (responseLower.includes(word) && responseLower.indexOf(word) > bestIndex - 50 && responseLower.indexOf(word) < bestIndex + 50) {
            contextBonus += 5;
          }
        }

        let contextPenalty = 0;
        for (const word of negativeWords) {
          if (responseLower.includes(word) && responseLower.indexOf(word) > bestIndex - 50 && responseLower.indexOf(word) < bestIndex + 50) {
            contextPenalty += 5;
          }
        }

        score += contextBonus - contextPenalty;
        if (contextBonus > 0) console.log(`📊 Positive context bonus: +${contextBonus} = ${score}`);
        if (contextPenalty > 0) console.log(`📊 Negative context penalty: -${contextPenalty} = ${score}`);

        // Bonus for being mentioned multiple times
        let mentionCount = 0;
        for (const nameVariation of businessNameVariations) {
          const regex = new RegExp(nameVariation.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          const matches = response.match(regex);
          if (matches) mentionCount += matches.length;
        }
        if (mentionCount > 1) {
          const multiMentionBonus = Math.min(15, mentionCount * 3);
          score += multiMentionBonus;
          console.log(`📊 Multiple mentions (${mentionCount}x): +${multiMentionBonus} = ${score}`);
        }

        relevanceScore = Math.min(100, Math.max(0, score));
        console.log(`🎯 Final relevance score: ${relevanceScore}`);
      }

      results.push({
        query,
        response,
        mentioned,
        rankPosition,
        relevanceScore
      });

      console.log(`✅ Query ${i + 1} completed: mentioned=${mentioned}, rank=${rankPosition}, score=${relevanceScore}`);

    } catch (error) {
      console.log(`❌ Query ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
      results.push({
        query,
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        mentioned: false,
        rankPosition: 0,
        relevanceScore: 0
      });
    }
  }

  const mentionCount = results.filter(r => r.mentioned).length;
  console.log(`\n🏁 Analysis complete! Found business in ${mentionCount}/${results.length} queries`);

  return results;
}

async function queryOpenAI(businessDescription: string): Promise<string> {
  try {
    console.log(`🤖 [OpenAI] Querying with: "${businessDescription}"`);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log(`❌ [OpenAI] API key not found`);
      return 'Error: OPENAI_API_KEY environment variable not set. Please add your OpenAI API key to the .env.local file.';
    }

    const client = new OpenAI({
      apiKey: apiKey,
    });

    const response = await client.responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      input: `Search the web and find current information as of ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} for: ${businessDescription}

Please provide ONLY a concise list of company names, business names, website names, or people names that are currently active and relevant to this query. Include both established companies and newer market entrants. Do not include descriptions, explanations, or additional information. Format as a simple list with one name per line. Be brief and direct.

Focus on companies that are currently operating and visible in the market today.`
    });

    const result = response.output_text;
    console.log(`✅ [OpenAI] Response received: ${result.length} characters`);
    return result;
  } catch (error) {
    console.error('❌ [OpenAI] Query error:', error);
    return `Error querying OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

function calculateEnhancedAEOScore(
  queryResults: QueryResult[],
  businessName: string,
  keywords: string[]
): { aeoScore: number; factors: ScoringFactors; analysis: string; overallVisibility: number; competitorAnalysis: CompetitorInfo[]; missedResponses: QueryResult[] } {
  console.log(`\n📊 Calculating AEO score for "${businessName}"`);
  console.log(`📈 Query results summary: ${queryResults.length} total queries`);

  const factors: ScoringFactors = {
    accuracy: 0,
    relevance: 0,
    completeness: 0,
    brandMention: 0,
    citations: 0,
    visibility: 0,
    ranking: 0
  };

  const totalQueries = queryResults.length;
  const mentionedQueries = queryResults.filter(r => r.mentioned).length;
  const validResponses = queryResults.filter(r => !r.response.startsWith('Error')).length;

  console.log(`📊 Found ${mentionedQueries} mentions out of ${totalQueries} queries`);
  console.log(`📊 ${validResponses} valid responses (non-error)`);

  factors.visibility = totalQueries > 0 ? Math.round((mentionedQueries / totalQueries) * 100) : 0;
  console.log(`📊 Visibility score: ${factors.visibility}%`);

  if (mentionedQueries > 0) {
    const avgRelevance = queryResults
      .filter(r => r.mentioned)
      .reduce((sum, r) => sum + r.relevanceScore, 0) / mentionedQueries;
    factors.relevance = Math.round(avgRelevance);
    console.log(`📊 Average relevance score: ${factors.relevance}`);

    const avgRankPosition = queryResults
      .filter(r => r.mentioned && r.rankPosition > 0)
      .reduce((sum, r) => sum + r.rankPosition, 0) / Math.max(mentionedQueries, 1);
    factors.ranking = Math.round(Math.max(0, 100 - (avgRankPosition - 1) * 25));
    console.log(`📊 Average rank position: ${avgRankPosition.toFixed(2)} → ranking score: ${factors.ranking}`);

    factors.brandMention = factors.visibility;
  }

  factors.accuracy = validResponses > 0 ? Math.round((validResponses / totalQueries) * 100) : 0;
  console.log(`📊 Accuracy score: ${factors.accuracy}%`);

  const responseLengths = queryResults
    .filter(r => r.mentioned)
    .map(r => r.response.length);
  const avgLength = responseLengths.length > 0
    ? responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length
    : 0;
  factors.completeness = Math.min(100, Math.round((avgLength / 300) * 100));

  const citationCount = queryResults.filter(r =>
    r.response.includes('http') ||
    r.response.includes('www.') ||
    r.response.includes('source') ||
    r.response.includes('according to')
  ).length;
  factors.citations = totalQueries > 0 ? Math.round((citationCount / totalQueries) * 100) : 0;

  const aeoScore = Math.round(
    (factors.visibility * 0.3) +
    (factors.relevance * 0.25) +
    (factors.ranking * 0.2) +
    (factors.brandMention * 0.15) +
    (factors.completeness * 0.05) +
    (factors.citations * 0.05)
  );

  console.log(`🏆 Final AEO Score calculation:`);
  console.log(`   Visibility (30%): ${factors.visibility} × 0.3 = ${(factors.visibility * 0.3).toFixed(1)}`);
  console.log(`   Relevance (25%): ${factors.relevance} × 0.25 = ${(factors.relevance * 0.25).toFixed(1)}`);
  console.log(`   Ranking (20%): ${factors.ranking} × 0.2 = ${(factors.ranking * 0.2).toFixed(1)}`);
  console.log(`   Brand Mention (15%): ${factors.brandMention} × 0.15 = ${(factors.brandMention * 0.15).toFixed(1)}`);
  console.log(`   Completeness (5%): ${factors.completeness} × 0.05 = ${(factors.completeness * 0.05).toFixed(1)}`);
  console.log(`   Citations (5%): ${factors.citations} × 0.05 = ${(factors.citations * 0.05).toFixed(1)}`);
  console.log(`🎯 TOTAL AEO SCORE: ${aeoScore}/100`);

  const overallVisibility = factors.visibility;

  let analysis = '';
  if (aeoScore >= 80) {
    analysis = `Excellent AEO performance! ${businessName} appears in ${mentionedQueries}/${totalQueries} AI queries with high relevance. Strong AI visibility across multiple query types.`;
  } else if (aeoScore >= 60) {
    analysis = `Good AEO score. ${businessName} appears in ${mentionedQueries}/${totalQueries} queries. Focus on improving content structure and online presence for better AI recognition.`;
  } else if (aeoScore >= 40) {
    analysis = `Fair AEO performance. ${businessName} appears in ${mentionedQueries}/${totalQueries} queries. Significant optimization needed for better AI engine visibility and ranking.`;
  } else {
    analysis = `Poor AEO score. ${businessName} appears in only ${mentionedQueries}/${totalQueries} queries. Critical optimization needed to improve AI engine recognition and ranking.`;
  }

  // Use keywords for context (preventing unused variable warning)
  if (keywords.length > 3) {
    analysis += ` Your ${keywords.length} keywords provide comprehensive context for AI analysis.`;
  }

  // Competitor analysis
  const competitorMentions = new Map<string, number>();
  const allCompanies = new Set<string>();
  
  queryResults.forEach(result => {
    if (!result.response.startsWith('Error')) {
      // Extract company names from responses
      const companies = result.response.match(/\b[A-Z][a-zA-Z\s&'-]+(?:\s(?:Inc|LLC|Corp|Corporation|Company|Co|Ltd|Limited|Solutions|Services|Group)\.?)?\b/g) || [];
      companies.forEach(company => {
        const cleanCompany = company.trim().replace(/[.,;:]$/, '');
        if (cleanCompany.length > 2 && !cleanCompany.toLowerCase().includes(businessName.toLowerCase())) {
          allCompanies.add(cleanCompany);
          competitorMentions.set(cleanCompany, (competitorMentions.get(cleanCompany) || 0) + 1);
        }
      });
    }
  });

  // Get top competitors (mentioned in multiple responses)
  const competitorAnalysis: CompetitorInfo[] = Array.from(competitorMentions.entries())
    .filter(([, mentions]) => mentions >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, mentions]) => ({
      name,
      mentions,
      score: Math.round((mentions / queryResults.filter(r => !r.response.startsWith('Error')).length) * 100)
    }));

  // Get responses that didn't mention the business
  const missedResponses = queryResults.filter(r => !r.mentioned && !r.response.startsWith('Error'));

  return { aeoScore, factors, analysis, overallVisibility, competitorAnalysis, missedResponses };
}

export async function POST(request: NextRequest) {
  try {
    console.log(`\n🚀 === NEW AEO ANALYSIS REQUEST ===`);
    const { businessName, keywords, providers } = await request.json();

    console.log(`🏢 Business Name: "${businessName}"`);
    console.log(`🔑 Keywords:`, keywords);
    console.log(`🤖 Providers:`, providers.map((p: AIProvider) => p.name));

    if (!businessName || !keywords || !providers) {
      console.log(`❌ Missing required fields`);
      return NextResponse.json({ error: 'Missing required fields: businessName, keywords, and providers' }, { status: 400 });
    }

    const results: ScoringResult[] = [];

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      console.log(`\n🔄 Processing provider ${i + 1}/${providers.length}: ${provider.name}`);
      
      // Only OpenAI is supported now
      const queryFunction = queryOpenAI;

      const queryResults = await queryAIWithVariations(queryFunction, businessName, keywords, MAX_QUERIES);
      const scoring = calculateEnhancedAEOScore(queryResults, businessName, keywords);

      const mainResponse = queryResults.length > 0 ? queryResults[0].response : 'No response generated';

      results.push({
        provider,
        response: mainResponse,
        aeoScore: scoring.aeoScore,
        factors: scoring.factors,
        analysis: scoring.analysis,
        queryVariations: queryResults,
        overallVisibility: scoring.overallVisibility,
        competitorAnalysis: scoring.competitorAnalysis,
        missedResponses: scoring.missedResponses
      });

      console.log(`✅ ${provider.name} analysis complete. Score: ${scoring.aeoScore}/100`);
    }

    console.log(`\n🏁 === ANALYSIS COMPLETE ===`);
    console.log(`📊 Results summary:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.provider.name}: ${result.aeoScore}/100 (${result.overallVisibility}% visibility)`);
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('❌ AEO Score API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze AEO scores' },
      { status: 500 }
    );
  }
}
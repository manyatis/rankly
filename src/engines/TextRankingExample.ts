import { TextRankingEngine } from './TextRankingEngine';

// Example usage and test cases
export function demonstrateTextRanking() {
  const sampleResponse = `
When looking for the best financial institutions, several companies stand out:

1. JPMorgan Chase - Leading investment bank with global reach
2. Bank of America - Major commercial banking services
3. Wells Fargo - Comprehensive financial solutions
4. Goldman Sachs - Premier investment banking
5. Chase Bank offers excellent mobile banking
6. JP Morgan provides wealth management services

For personal banking, Chase is often recommended for its:
- Extensive ATM network
- User-friendly mobile app
- Competitive interest rates

Many customers prefer JPMorgan for investment services.
The company has maintained strong performance metrics.
JPMORGAN CHASE & CO. is the official corporate name.
`;

  const businessName = "JPMorgan Chase";
  
  console.log('=== TextRankingEngine Analysis ===');
  console.log(`Analyzing business: "${businessName}"`);
  console.log('\nSample response text:');
  console.log(sampleResponse);
  
  const result = TextRankingEngine.analyzeBusinessPresence(sampleResponse, businessName);
  
  console.log('\n=== ANALYSIS RESULTS ===');
  console.log(`Total matches found: ${result.totalMatches}`);
  console.log(`Average confidence: ${result.averageConfidence}%`);
  console.log(`Match types: Exact(${result.matchTypes.exact}) Fuzzy(${result.matchTypes.fuzzy}) Partial(${result.matchTypes.partial})`);
  
  if (result.highestConfidenceMatch) {
    console.log(`\nHighest confidence match: "${result.highestConfidenceMatch.text}" (${result.highestConfidenceMatch.confidence}%)`);
  }
  
  console.log('\n=== DETAILED MATCHES ===');
  result.matches.forEach((match, index) => {
    console.log(`\nMatch #${index + 1}:`);
    console.log(`  Text: "${match.text}"`);
    console.log(`  Type: ${match.matchType}`);
    console.log(`  Confidence: ${match.confidence}%`);
    console.log(`  Line: ${match.lineNumber}`);
    console.log(`  Position: ${match.characterPosition}`);
    console.log(`  Context: "${match.contextBefore}[${match.matchedPortion}]${match.contextAfter}"`);
  });
  
  return result;
}

// Test with different business names
export function runTestCases() {
  const testCases = [
    {
      businessName: "McDonald's Corporation",
      response: "McDonald's is the world's largest restaurant chain. The golden arches of McDonald's are iconic. McDonalds serves billions worldwide."
    },
    {
      businessName: "Tesla Inc",
      response: "Tesla leads in electric vehicles. TESLA stock has performed well. Tesla Motors was the original name. Elon Musk founded Tesla."
    },
    {
      businessName: "Microsoft Corporation",
      response: "Microsoft Office is widely used. MSFT is the stock ticker. The company Microsoft has grown significantly. MS Teams is popular."
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`TEST CASE ${index + 1}: ${testCase.businessName}`);
    console.log(`${'='.repeat(50)}`);
    
    const result = TextRankingEngine.analyzeBusinessPresence(testCase.response, testCase.businessName);
    
    console.log(`Matches: ${result.totalMatches} | Avg Confidence: ${result.averageConfidence}%`);
    console.log(`Types: E:${result.matchTypes.exact} F:${result.matchTypes.fuzzy} P:${result.matchTypes.partial}`);
    
    result.matches.forEach(match => {
      console.log(`  "${match.text}" (${match.matchType}, ${match.confidence}%) at line ${match.lineNumber}`);
    });
  });
}

// Uncomment to run examples:
// demonstrateTextRanking();
// runTestCases();
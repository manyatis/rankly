import { ModelFactory } from '../lib/ai-models/ModelFactory';
import { prisma } from '../lib/prisma';

export interface CompetitorInput {
  businessName: string;
  websiteUrl?: string;
  description?: string;
  industry?: string;
  location?: string;
}

export interface IdentifiedCompetitor {
  name: string;
  website?: string;
  description?: string;
  confidence: number; // 0.0 to 1.0
}

export class CompetitorService {
  /**
   * Identifies competitors using OpenAI based on business information
   */
  static async identifyCompetitors(input: CompetitorInput): Promise<IdentifiedCompetitor[]> {
    try {
      console.log(`🤖 Building competitor prompt for: ${input.businessName}`);
      const prompt = this.buildCompetitorPrompt(input);
      
      console.log(`🔄 Querying OpenAI for competitors...`);
      const response = await ModelFactory.queryModel('openai', prompt);
      
      console.log(`📝 OpenAI response length: ${response.length} characters`);
      console.log(`📝 OpenAI response preview: ${response.substring(0, 200)}...`);
      
      const competitors = this.parseCompetitorResponse(response);
      console.log(`✅ Parsed ${competitors.length} competitors from response`);
      
      return competitors;
    } catch (error) {
      console.error('❌ Error identifying competitors:', error);
      throw new Error('Failed to identify competitors');
    }
  }

  /**
   * Stores competitors in the database and creates business entries
   */
  static async storeCompetitors(
    businessId: number, 
    competitors: IdentifiedCompetitor[]
  ): Promise<void> {
    try {
      console.log(`💾 Storing ${competitors.length} competitors for business ID ${businessId}`);
      
      if (competitors.length === 0) {
        console.log(`ℹ️ No competitors to store`);
        return;
      }
      
      // Use transaction for atomic operations
      await prisma.$transaction(async (tx) => {
        for (const competitor of competitors) {
          try {
            console.log(`🔍 Processing competitor: ${competitor.name}`);
            
            // Validate competitor data
            if (!competitor.name?.trim()) {
              console.warn(`⚠️ Skipping competitor with empty name:`, competitor);
              continue;
            }
            
            const cleanName = competitor.name.trim();
            const cleanWebsite = competitor.website?.trim() || null;
            const cleanDescription = competitor.description?.trim() || null;
            const validatedConfidence = Math.max(0.1, Math.min(1.0, competitor.confidence || 0.5));
            
            console.log(`📊 Validated competitor data: name="${cleanName}", confidence=${validatedConfidence}`);
            
            // Check if competitor business already exists by URL (primary identifier)
            let competitorBusiness = cleanWebsite ? await tx.business.findUnique({
              where: { websiteUrl: cleanWebsite }
            }) : null;

            // If not found by URL, try by name as fallback for existing data
            if (!competitorBusiness && cleanWebsite) {
              competitorBusiness = await tx.business.findFirst({
                where: { websiteName: cleanName }
              });
            }

            // Create competitor business if it doesn't exist
            if (!competitorBusiness) {
              console.log(`➕ Creating new business entry for: ${cleanName}`);
              try {
                competitorBusiness = await tx.business.create({
                  data: {
                    websiteName: cleanName,
                    websiteUrl: cleanWebsite,
                    description: cleanDescription,
                    isCompetitor: true,
                    userId: null, // No user for competitor businesses
                  }
                });
                console.log(`✅ Created business entry with ID: ${competitorBusiness.id}`);
              } catch (createError) {
                console.error(`❌ Failed to create business for ${cleanName}:`, createError);
                continue; // Skip this competitor and continue with others
              }
            } else {
              console.log(`♻️ Found existing business entry for: ${cleanName} (ID: ${competitorBusiness.id})`);
              
              // Update existing business to mark as competitor if not already
              if (!competitorBusiness.isCompetitor) {
                await tx.business.update({
                  where: { id: competitorBusiness.id },
                  data: { isCompetitor: true }
                });
                console.log(`🔄 Updated existing business to mark as competitor`);
              }
            }

            // Create competitor relationship if it doesn't exist
            const existingRelation = await tx.competitor.findUnique({
              where: {
                businessId_competitorId: {
                  businessId,
                  competitorId: competitorBusiness.id
                }
              }
            });

            if (!existingRelation) {
              console.log(`🔗 Creating competitor relationships for ${cleanName}`);
              
              try {
                // Primary relationship (businessId -> competitorId)
                await tx.competitor.create({
                  data: {
                    businessId,
                    competitorId: competitorBusiness.id,
                    identifiedBy: 'ai',
                    confidence: validatedConfidence
                  }
                });

                // Check if reverse relationship already exists before creating
                const existingReverse = await tx.competitor.findUnique({
                  where: {
                    businessId_competitorId: {
                      businessId: competitorBusiness.id,
                      competitorId: businessId
                    }
                  }
                });

                if (!existingReverse) {
                  // Create bidirectional relationship
                  await tx.competitor.create({
                    data: {
                      businessId: competitorBusiness.id,
                      competitorId: businessId,
                      identifiedBy: 'ai',
                      confidence: validatedConfidence
                    }
                  });
                }
                
                console.log(`✅ Created bidirectional relationships for ${cleanName}`);
              } catch (relationError) {
                console.error(`❌ Failed to create competitor relationship for ${cleanName}:`, relationError);
                // Continue with other competitors even if one fails
              }
            } else {
              console.log(`♻️ Competitor relationship already exists for ${cleanName}`);
            }
          } catch (competitorError) {
            console.error(`❌ Error processing competitor ${competitor.name}:`, competitorError);
            // Continue with other competitors
          }
        }
      });
      
      console.log(`🎉 Completed processing all ${competitors.length} competitors`);
    } catch (error) {
      console.error('❌ Error in storeCompetitors transaction:', error);
      throw new Error(`Failed to store competitors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets all competitors for a business
   */
  static async getCompetitors(businessId: number) {
    try {
      // Find competitor relationships where this business is the main business
      const competitorRelationships = await prisma.competitor.findMany({
        where: {
          businessId: businessId
        },
        include: {
          competitor: true // This gives us the actual competitor business
        }
      });

      console.log(`🔍 Found ${competitorRelationships.length} competitor relationships for business ${businessId}`);
      
      return competitorRelationships.map(rel => ({
        id: rel.competitor.id,
        name: rel.competitor.websiteName,
        website: rel.competitor.websiteUrl,
        description: rel.competitor.description,
        confidence: rel.confidence,
        identifiedBy: rel.identifiedBy,
        createdAt: rel.createdAt
      }));
    } catch (error) {
      console.error('Error getting competitors:', error);
      return [];
    }
  }

  /**
   * Builds the prompt for competitor identification
   */
  private static buildCompetitorPrompt(input: CompetitorInput): string {
    return `Find 8 direct competitors for this business:

Business: ${input.businessName}
Industry: ${input.industry || 'Not specified'}
Website: ${input.websiteUrl || 'Not specified'}

Return ONLY valid JSON array:
[
  {
    "name": "Competitor Name",
    "website": "https://competitor.com",
    "confidence": 0.9
  }
]

Rules:
- Exactly 8 competitors maximum
- confidence: 0.1 to 1.0
- website: full URL or null
- Real businesses only
- No text outside JSON

JSON:`;
  }

  /**
   * Parses the AI response to extract competitor information
   */
  private static parseCompetitorResponse(response: string): IdentifiedCompetitor[] {
    try {
      console.log('🔍 Raw AI response for parsing (first 500 chars):', response.substring(0, 500));
      console.log('🔍 Raw AI response length:', response.length);
      
      // Try multiple parsing strategies
      let competitors: Array<{name: string; website?: string; confidence?: number}> = [];
      
      // Strategy 1: Try to parse the entire response as JSON
      try {
        const parsed = JSON.parse(response.trim());
        if (Array.isArray(parsed)) {
          competitors = parsed;
          console.log('✅ Strategy 1: Parsed entire response as JSON array');
        }
      } catch {
        console.log('❌ Strategy 1 failed: Response is not valid JSON');
      }
      
      // Strategy 2: Extract JSON array using improved bracket matching
      if (competitors.length === 0) {
        const startIndex = response.indexOf('[');
        if (startIndex !== -1) {
          let bracketCount = 0;
          let endIndex = -1;
          let inString = false;
          let escapeNext = false;
          
          for (let i = startIndex; i < response.length; i++) {
            const char = response[i];
            
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            
            if (char === '"') {
              inString = !inString;
              continue;
            }
            
            if (!inString) {
              if (char === '[') {
                bracketCount++;
              } else if (char === ']') {
                bracketCount--;
                if (bracketCount === 0) {
                  endIndex = i;
                  break;
                }
              }
            }
          }
          
          if (endIndex !== -1) {
            const jsonStr = response.substring(startIndex, endIndex + 1);
            console.log('📦 Strategy 2: Extracted JSON string:', jsonStr);
            
            try {
              const parsed = JSON.parse(jsonStr);
              if (Array.isArray(parsed)) {
                competitors = parsed;
                console.log('✅ Strategy 2: Successfully parsed JSON array');
              }
            } catch {
              console.log('❌ Strategy 2 failed: Invalid JSON in extracted string');
            }
          } else {
            console.log('❌ Strategy 2 failed: No matching closing bracket found');
          }
        }
      }
      
      // Strategy 3: Try to extract from code blocks (```json)
      if (competitors.length === 0) {
        const codeBlockMatch = response.match(/```(?:json)?\s*(\[.*?\])\s*```/);
        if (codeBlockMatch) {
          try {
            const parsed = JSON.parse(codeBlockMatch[1]);
            if (Array.isArray(parsed)) {
              competitors = parsed;
              console.log('✅ Strategy 3: Parsed JSON from code block');
            }
          } catch {
            console.log('❌ Strategy 3 failed: Invalid JSON in code block');
          }
        }
      }
      
      // Strategy 4: Look for array patterns even without proper JSON
      if (competitors.length === 0) {
        console.log('🔄 Strategy 4: Attempting to extract array patterns...');
        // This is a fallback - try to find array-like patterns
        const arrayMatch = response.match(/\[\s*{[\s\S]*}\s*\]/);
        if (arrayMatch) {
          try {
            const parsed = JSON.parse(arrayMatch[0]);
            if (Array.isArray(parsed)) {
              competitors = parsed;
              console.log('✅ Strategy 4: Parsed array pattern');
            }
          } catch {
            console.log('❌ Strategy 4 failed: Could not parse array pattern');
          }
        }
      }
      
      // Strategy 5: Check for empty array or text indicating no competitors
      if (competitors.length === 0) {
        console.log('🔄 Strategy 5: Checking for empty array or no-competitor indicators...');
        
        // Check if response contains an empty array
        if (response.includes('[]')) {
          console.log('✅ Strategy 5: Found empty array - no competitors available');
          return [];
        }
        
        // Check for common phrases indicating no competitors found
        const noCompetitorPhrases = [
          'no competitors',
          'cannot identify',
          'insufficient information',
          'unable to determine',
          'lack sufficient',
          'not enough information'
        ];
        
        const lowerResponse = response.toLowerCase();
        const foundPhrase = noCompetitorPhrases.find(phrase => lowerResponse.includes(phrase));
        
        if (foundPhrase) {
          console.log(`✅ Strategy 5: AI indicated no competitors available (found phrase: "${foundPhrase}")`);
          return [];
        }
        
        // If we get here, the AI returned something but we can't parse it
        console.log('🔄 Strategy 5: Response contains content but no parseable competitors');
        console.log('📝 Full response for manual inspection:', response);
      }

      if (competitors.length === 0) {
        console.warn('⚠️ All parsing strategies failed - no competitors found');
        console.warn('📄 Full response that could not be parsed:', response);
        return [];
      }

      console.log(`🔢 Found ${competitors.length} raw competitors before filtering`);

      const processedCompetitors = competitors
        .filter(comp => {
          if (!comp || typeof comp !== 'object') {
            console.warn('⚠️ Skipping non-object competitor:', comp);
            return false;
          }
          if (!comp.name || typeof comp.name !== 'string' || !comp.name.trim()) {
            console.warn('⚠️ Skipping competitor with invalid name:', comp);
            return false;
          }
          return true;
        })
        .map(comp => ({
          name: comp.name.trim(),
          website: comp.website?.trim() || undefined,
          description: undefined, // No description in simplified format
          confidence: Math.max(0.1, Math.min(1.0, comp.confidence || 0.5))
        }))
        .slice(0, 8); // Ensure max 8 competitors

      console.log(`✅ Successfully processed ${processedCompetitors.length} competitors`);
      return processedCompetitors;

    } catch (error) {
      console.error('❌ Error parsing competitor response:', error);
      console.error('📄 Response that failed to parse:', response);
      return [];
    }
  }
}
-- Migration script to handle Business table restructure
-- Run this before applying the Prisma schema changes

-- Step 1: Create the new tables first (Prisma will do this)

-- Step 2: Migrate existing Business-Organization relationships to the junction table
-- This will be done after the new tables are created

-- Step 3: Handle websiteName uniqueness conflicts
-- Update duplicate websiteNames with a suffix
UPDATE "Business" 
SET "websiteName" = "websiteName" || '_' || "id" 
WHERE "id" IN (
  SELECT "id" FROM (
    SELECT "id", 
           ROW_NUMBER() OVER (PARTITION BY "websiteName" ORDER BY "id") as rn
    FROM "Business"
  ) t WHERE rn > 1
);

-- Step 4: Note - the organizationId will be moved to OrganizationBusiness table
-- This needs to be done in the application after schema update
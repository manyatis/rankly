/*
  Warnings:

  - You are about to drop the column `businessName` on the `AeoScore` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,date,businessId]` on the table `AeoScore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sessionToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `businessId` to the `AeoScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionToken` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "AeoScore_userId_date_businessName_key";

-- DropIndex
DROP INDEX "Session_token_idx";

-- DropIndex
DROP INDEX "Session_token_key";

-- AlterTable
ALTER TABLE "AeoScore" DROP COLUMN "businessName",
ADD COLUMN     "businessId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "token",
DROP COLUMN "updatedAt",
ADD COLUMN     "expires" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sessionToken" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Session_id_seq";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "analyzeWebsiteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "analyzeWebsiteResetTime" TIMESTAMP(3),
ADD COLUMN     "dailyUsageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "generatePromptsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "generatePromptsResetTime" TIMESTAMP(3),
ADD COLUMN     "lastUsageDate" TIMESTAMP(3),
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "subscriptionTier" TEXT NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "websiteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" SERIAL NOT NULL,
    "websiteName" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "userId" INTEGER,
    "industry" TEXT,
    "location" TEXT,
    "description" TEXT,
    "isCompetitor" BOOLEAN NOT NULL DEFAULT false,
    "recurringScans" BOOLEAN NOT NULL DEFAULT false,
    "scanFrequency" TEXT,
    "lastScanDate" TIMESTAMP(3),
    "nextScanDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "runUuid" TEXT,
    "keywords" TEXT[],
    "prompts" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InputHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "runUuid" TEXT,
    "openaiRank" INTEGER,
    "claudeRank" INTEGER,
    "perplexityRank" INTEGER,
    "averageRank" INTEGER,
    "websiteScore" INTEGER,
    "hasWebsiteAnalysis" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "runUuid" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "criticality" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "effort" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "aiProvider" TEXT,
    "confidence" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'new',
    "recommendations" TEXT[],
    "currentScore" INTEGER,
    "potentialImprovement" INTEGER,
    "affectedQueries" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationBusiness" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "competitorId" INTEGER NOT NULL,
    "identifiedBy" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Business_userId_idx" ON "Business"("userId");

-- CreateIndex
CREATE INDEX "Business_websiteName_idx" ON "Business"("websiteName");

-- CreateIndex
CREATE INDEX "Business_isCompetitor_idx" ON "Business"("isCompetitor");

-- CreateIndex
CREATE UNIQUE INDEX "Business_websiteName_key" ON "Business"("websiteName");

-- CreateIndex
CREATE UNIQUE INDEX "InputHistory_runUuid_key" ON "InputHistory"("runUuid");

-- CreateIndex
CREATE INDEX "InputHistory_userId_createdAt_idx" ON "InputHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "InputHistory_businessId_idx" ON "InputHistory"("businessId");

-- CreateIndex
CREATE INDEX "InputHistory_runUuid_idx" ON "InputHistory"("runUuid");

-- CreateIndex
CREATE UNIQUE INDEX "RankingHistory_runUuid_key" ON "RankingHistory"("runUuid");

-- CreateIndex
CREATE INDEX "RankingHistory_userId_createdAt_idx" ON "RankingHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RankingHistory_businessId_idx" ON "RankingHistory"("businessId");

-- CreateIndex
CREATE INDEX "RankingHistory_runUuid_idx" ON "RankingHistory"("runUuid");

-- CreateIndex
CREATE INDEX "AIInsight_userId_businessId_idx" ON "AIInsight"("userId", "businessId");

-- CreateIndex
CREATE INDEX "AIInsight_businessId_createdAt_idx" ON "AIInsight"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "AIInsight_status_idx" ON "AIInsight"("status");

-- CreateIndex
CREATE INDEX "AIInsight_runUuid_idx" ON "AIInsight"("runUuid");

-- CreateIndex
CREATE INDEX "OrganizationBusiness_organizationId_idx" ON "OrganizationBusiness"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationBusiness_businessId_idx" ON "OrganizationBusiness"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationBusiness_organizationId_businessId_key" ON "OrganizationBusiness"("organizationId", "businessId");

-- CreateIndex
CREATE INDEX "Competitor_businessId_idx" ON "Competitor"("businessId");

-- CreateIndex
CREATE INDEX "Competitor_competitorId_idx" ON "Competitor"("competitorId");

-- CreateIndex
CREATE UNIQUE INDEX "Competitor_businessId_competitorId_key" ON "Competitor"("businessId", "competitorId");

-- CreateIndex
CREATE INDEX "AeoScore_businessId_idx" ON "AeoScore"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "AeoScore_userId_date_businessId_key" ON "AeoScore"("userId", "date", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AeoScore" ADD CONSTRAINT "AeoScore_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputHistory" ADD CONSTRAINT "InputHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputHistory" ADD CONSTRAINT "InputHistory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingHistory" ADD CONSTRAINT "RankingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingHistory" ADD CONSTRAINT "RankingHistory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationBusiness" ADD CONSTRAINT "OrganizationBusiness_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationBusiness" ADD CONSTRAINT "OrganizationBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

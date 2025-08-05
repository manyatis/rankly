/*
  Warnings:

  - A unique constraint covering the columns `[userId,businessId,date,category]` on the table `AIInsight` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId,date]` on the table `RankingHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `RankingHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RankingHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AIInsight_businessId_createdAt_idx";

-- DropIndex
DROP INDEX "RankingHistory_businessId_idx";

-- DropIndex
DROP INDEX "RankingHistory_runUuid_key";

-- AlterTable
ALTER TABLE "AIInsight" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RankingHistory" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "QueryResult" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "businessId" INTEGER NOT NULL,
    "runUuid" TEXT,
    "query" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "mentioned" BOOLEAN NOT NULL,
    "rankPosition" INTEGER,
    "relevanceScore" INTEGER,
    "wordCount" INTEGER,
    "businessDensity" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueryResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QueryResult_userId_createdAt_idx" ON "QueryResult"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "QueryResult_businessId_idx" ON "QueryResult"("businessId");

-- CreateIndex
CREATE INDEX "QueryResult_runUuid_idx" ON "QueryResult"("runUuid");

-- CreateIndex
CREATE INDEX "QueryResult_aiProvider_idx" ON "QueryResult"("aiProvider");

-- CreateIndex
CREATE INDEX "AIInsight_businessId_date_idx" ON "AIInsight"("businessId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AIInsight_userId_businessId_date_category_key" ON "AIInsight"("userId", "businessId", "date", "category");

-- CreateIndex
CREATE INDEX "RankingHistory_businessId_date_idx" ON "RankingHistory"("businessId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RankingHistory_businessId_date_key" ON "RankingHistory"("businessId", "date");

-- AddForeignKey
ALTER TABLE "QueryResult" ADD CONSTRAINT "QueryResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryResult" ADD CONSTRAINT "QueryResult_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

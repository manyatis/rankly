/*
  Warnings:

  - A unique constraint covering the columns `[websiteUrl]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "InputHistory" DROP CONSTRAINT "InputHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "RankingHistory" DROP CONSTRAINT "RankingHistory_userId_fkey";

-- DropIndex
DROP INDEX "Business_websiteName_key";

-- AlterTable
ALTER TABLE "InputHistory" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RankingHistory" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Business_websiteUrl_idx" ON "Business"("websiteUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Business_websiteUrl_key" ON "Business"("websiteUrl");

-- AddForeignKey
ALTER TABLE "InputHistory" ADD CONSTRAINT "InputHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingHistory" ADD CONSTRAINT "RankingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

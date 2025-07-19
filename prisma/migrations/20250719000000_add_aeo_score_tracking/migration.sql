-- CreateTable
CREATE TABLE "AeoScore" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,
    "businessName" TEXT NOT NULL,
    "keywords" TEXT[],
    "visibility" INTEGER NOT NULL,
    "ranking" INTEGER NOT NULL,
    "relevance" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AeoScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AeoScore_userId_date_idx" ON "AeoScore"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AeoScore_userId_date_businessName_key" ON "AeoScore"("userId", "date", "businessName");

-- AddForeignKey
ALTER TABLE "AeoScore" ADD CONSTRAINT "AeoScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- CreateTable
CREATE TABLE "draft_quotes" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalValue" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "shopifyCreatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "daysToConvert" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "rowUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draft_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "draft_quotes_shop_status_idx" ON "draft_quotes"("shop", "status");

-- CreateIndex
CREATE INDEX "draft_quotes_shop_deletedAt_idx" ON "draft_quotes"("shop", "deletedAt");

-- CreateIndex
CREATE INDEX "draft_quotes_shop_shopifyCreatedAt_idx" ON "draft_quotes"("shop", "shopifyCreatedAt");

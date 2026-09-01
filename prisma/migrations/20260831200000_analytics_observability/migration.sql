-- AlterTable: anonymous identity for signed-out analytics (spec §6)
ALTER TABLE "AnalyticsEvent" ADD COLUMN "anonymousId" TEXT;

-- CreateIndex
CREATE INDEX "AnalyticsEvent_anonymousId_idx" ON "AnalyticsEvent"("anonymousId");

-- CreateTable: Content Intelligence
CREATE TABLE "SearchQueryLog" (
    "id" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "rawQuery" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "userId" TEXT,
    "anonymousId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchQueryLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SearchQueryLog_normalizedQuery_idx" ON "SearchQueryLog"("normalizedQuery");
CREATE INDEX "SearchQueryLog_createdAt_idx" ON "SearchQueryLog"("createdAt");
CREATE INDEX "SearchQueryLog_resultCount_idx" ON "SearchQueryLog"("resultCount");

CREATE TABLE "ContentOpportunityDismissal" (
    "id" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "dismissedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentOpportunityDismissal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentOpportunityDismissal_normalizedQuery_key" ON "ContentOpportunityDismissal"("normalizedQuery");

ALTER TABLE "ContentOpportunityDismissal" ADD CONSTRAINT "ContentOpportunityDismissal_dismissedByUserId_fkey" FOREIGN KEY ("dismissedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum: Technical Observability
CREATE TYPE "ErrorSeverity" AS ENUM ('WARNING', 'ERROR', 'CRITICAL');

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "path" TEXT,
    "severity" "ErrorSeverity" NOT NULL DEFAULT 'ERROR',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ErrorLog_severity_idx" ON "ErrorLog"("severity");
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");

CREATE TABLE "PerformanceLog" (
    "id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "failed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PerformanceLog_operation_idx" ON "PerformanceLog"("operation");
CREATE INDEX "PerformanceLog_createdAt_idx" ON "PerformanceLog"("createdAt");

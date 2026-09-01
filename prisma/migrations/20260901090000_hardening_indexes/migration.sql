-- Phase 12 performance audit: missing indexes on FK/filter columns.

-- CreateIndex
CREATE INDEX "Experience_status_idx" ON "Experience"("status");

-- CreateIndex
CREATE INDEX "Food_status_idx" ON "Food"("status");

-- CreateIndex
CREATE INDEX "FestivalOccurrence_verifiedByUserId_idx" ON "FestivalOccurrence"("verifiedByUserId");

-- CreateIndex
CREATE INDEX "TripItem_locationId_idx" ON "TripItem"("locationId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX "ContentOpportunityDismissal_dismissedByUserId_idx" ON "ContentOpportunityDismissal"("dismissedByUserId");

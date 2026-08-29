-- AlterTable: city-level transport/accommodation guidance (Phase 4)
ALTER TABLE "Location"
  ADD COLUMN "nearestAirport" TEXT,
  ADD COLUMN "nearestRailwayStation" TEXT,
  ADD COLUMN "roadAccessNotes" TEXT,
  ADD COLUMN "localTransportNotes" TEXT,
  ADD COLUMN "accommodationNotes" TEXT;

-- AlterTable: editorial featuring flag for ranking (Phase 3/4/5 spec)
ALTER TABLE "Festival" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Festival_featured_idx" ON "Festival"("featured");

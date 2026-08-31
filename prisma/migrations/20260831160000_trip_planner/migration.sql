-- AlterTable: real trip metadata (dates, travellers, region) for the itinerary builder
ALTER TABLE "Trip" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "Trip" ADD COLUMN "endDate" TIMESTAMP(3);
ALTER TABLE "Trip" ADD COLUMN "travellerCount" INTEGER;
ALTER TABLE "Trip" ADD COLUMN "locationId" TEXT;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Trip_locationId_idx" ON "Trip"("locationId");

-- AlterEnum
ALTER TYPE "AnalyticsEventType" ADD VALUE 'TRIP_INTERACTION';

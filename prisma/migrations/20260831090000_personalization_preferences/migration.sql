-- TravelStyle: replace the Phase 1 placeholder vocabulary (RELAXED/ADVENTURE/
-- CULTURAL/OFFBEAT/MIXED) with the onboarding UI's real options. UserPreference
-- has zero rows so far (nothing has ever written this field), so a straight
-- drop/recreate is safe rather than a value-by-value rename.
ALTER TABLE "UserPreference" DROP COLUMN "travelStyle";
DROP TYPE "TravelStyle";
CREATE TYPE "TravelStyle" AS ENUM ('BACKPACKER', 'BUDGET', 'COMFORTABLE', 'LUXURY');
ALTER TABLE "UserPreference" ADD COLUMN "travelStyle" "TravelStyle";

-- CrowdPreference: replace the 3-value categorical enum with a continuous
-- 0 (busy & lively) .. 100 (quiet & peaceful) slider value, storable/usable
-- numerically by the ranking engine. Same "no existing rows" safety as above.
ALTER TABLE "UserPreference" DROP COLUMN "crowdPreference";
DROP TYPE "CrowdPreference";
ALTER TABLE "UserPreference" ADD COLUMN "crowdPreference" INTEGER;

-- Numeric total trip budget (INR), alongside the existing budgetLevel bucket.
ALTER TABLE "UserPreference" ADD COLUMN "budgetAmount" INTEGER;

-- AlterEnum
ALTER TYPE "AnalyticsEventType" ADD VALUE 'ONBOARDING_INTERACTION';
ALTER TYPE "AnalyticsEventType" ADD VALUE 'PREFERENCE_UPDATED';
ALTER TYPE "AnalyticsEventType" ADD VALUE 'RECOMMENDATION_VIEWED';

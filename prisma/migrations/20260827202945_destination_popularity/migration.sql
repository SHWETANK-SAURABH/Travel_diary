-- Renamed in-place (not dropped/recreated) so existing Festival.popularity
-- values survive — this enum is now shared by Festival and Destination
-- (see the comment on ContentPopularity in schema.prisma).
ALTER TYPE "FestivalPopularity" RENAME TO "ContentPopularity";

-- AlterTable
ALTER TABLE "Destination" ADD COLUMN "popularity" "ContentPopularity" NOT NULL DEFAULT 'LOCAL_EMERGING';

-- CreateIndex
CREATE INDEX "Destination_popularity_idx" ON "Destination"("popularity");

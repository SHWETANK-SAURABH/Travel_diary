-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('FESTIVAL', 'FESTIVAL_OCCURRENCE', 'DESTINATION', 'EXPERIENCE', 'FOOD', 'LOCATION', 'MEDIA', 'FESTIVAL_CATEGORY', 'DESTINATION_CATEGORY', 'TAG');

-- AlterTable: publishing state + featured flag for the two content types that never had them.
-- New rows default to DRAFT (matches every other content model); existing seeded/live rows are
-- backfilled to PUBLISHED immediately below so they don't silently vanish from public pages the
-- moment status filtering is added to the read paths.
ALTER TABLE "Experience" ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Experience" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Experience" SET "status" = 'PUBLISHED';

ALTER TABLE "Food" ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Food" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Food" SET "status" = 'PUBLISHED';

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityLabel" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

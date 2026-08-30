-- CreateTable
CREATE TABLE "DestinationCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DestinationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DestinationCategory_slug_key" ON "DestinationCategory"("slug");

-- AlterTable
ALTER TABLE "Destination"
  ADD COLUMN "categoryId" TEXT,
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "DestinationCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Destination_categoryId_idx" ON "Destination"("categoryId");
CREATE INDEX "Destination_featured_idx" ON "Destination"("featured");

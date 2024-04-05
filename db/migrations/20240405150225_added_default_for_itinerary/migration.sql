/*
  Warnings:

  - Made the column `itinerary` on table `Trip` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "itinerary" SET NOT NULL,
ALTER COLUMN "itinerary" SET DEFAULT '{}';

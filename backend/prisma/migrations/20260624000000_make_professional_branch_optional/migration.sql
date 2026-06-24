-- AlterTable: make professionalId and branchId optional
-- These columns were created NOT NULL but clinics from Google Places
-- don't have professionals or branches registered in the DB.
ALTER TABLE "appointments" ALTER COLUMN "professionalId" DROP NOT NULL;
ALTER TABLE "appointments" ALTER COLUMN "branchId" DROP NOT NULL;

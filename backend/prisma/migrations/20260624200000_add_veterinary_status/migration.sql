-- CreateEnum
CREATE TYPE "VeterinaryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum: Add VETERINARY_APPROVAL_REQUEST to NotificationType
ALTER TYPE "NotificationType" ADD VALUE 'VETERINARY_APPROVAL_REQUEST';

-- AlterTable: Add status and rejectionReason to veterinary_profiles
ALTER TABLE "veterinary_profiles"
  ADD COLUMN "status" "VeterinaryStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "rejectionReason" TEXT;

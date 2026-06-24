-- CreateEnum
CREATE TYPE "VeterinaryType" AS ENUM ('CLINIC', 'INDEPENDENT');

-- CreateTable
CREATE TABLE "veterinary_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "veterinaryType" "VeterinaryType" NOT NULL,
    "serviceArea" TEXT,
    "homeVisits" BOOLEAN NOT NULL DEFAULT false,
    "coverageRadius" DOUBLE PRECISION,
    "clinicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veterinary_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "veterinary_profiles_userId_key" ON "veterinary_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "veterinary_profiles_clinicId_key" ON "veterinary_profiles"("clinicId");

-- AddForeignKey
ALTER TABLE "veterinary_profiles" ADD CONSTRAINT "veterinary_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veterinary_profiles" ADD CONSTRAINT "veterinary_profiles_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

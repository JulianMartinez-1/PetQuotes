-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pet_ownerId_idx" ON "Pet"("ownerId");

-- Backfill pets from existing appointment records
INSERT INTO "Pet" ("id", "ownerId", "name", "species", "createdAt", "updatedAt")
SELECT DISTINCT ON ("petId")
  "petId",
  "clientId",
  'Mascota ' || "petId",
  'Unknown',
  NOW(),
  NOW()
FROM "Appointment"
WHERE NOT EXISTS (
  SELECT 1 FROM "Pet" p WHERE p."id" = "Appointment"."petId"
);

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Appointment_petId_fkey'
  ) THEN
    ALTER TABLE "Appointment"
    ADD CONSTRAINT "Appointment_petId_fkey"
    FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_petId_startsAt_idx" ON "Appointment"("petId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_veterinarianId_startsAt_key" ON "Appointment"("veterinarianId", "startsAt");

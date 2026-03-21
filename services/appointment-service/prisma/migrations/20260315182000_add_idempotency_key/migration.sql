-- AlterTable
ALTER TABLE "Appointment"
ADD COLUMN "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_idempotencyKey_key" ON "Appointment"("idempotencyKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_clientId_startsAt_idx" ON "Appointment"("clientId", "startsAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_veterinarianId_startsAt_idx" ON "Appointment"("veterinarianId", "startsAt");

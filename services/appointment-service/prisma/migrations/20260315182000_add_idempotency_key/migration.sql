-- AlterTable
ALTER TABLE "Appointment"
ADD COLUMN "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_idempotencyKey_key" ON "Appointment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Appointment_clientId_startsAt_idx" ON "Appointment"("clientId", "startsAt");

-- CreateIndex
CREATE INDEX "Appointment_veterinarianId_startsAt_idx" ON "Appointment"("veterinarianId", "startsAt");

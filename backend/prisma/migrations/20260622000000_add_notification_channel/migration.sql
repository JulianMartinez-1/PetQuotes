-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'WHATSAPP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable: add notificationChannel to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notificationChannel" "NotificationChannel";

-- Add age column that exists in schema but was missing from initial migration
ALTER TABLE "pets" ADD COLUMN "age" TEXT;

-- Make name nullable to match current Prisma schema (name String?)
ALTER TABLE "pets" ALTER COLUMN "name" DROP NOT NULL;
